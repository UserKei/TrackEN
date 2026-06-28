import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/domain/token_pair.dart';
import '../config/app_env.dart';
import '../models/api_response.dart';
import '../storage/secure_token_store.dart';
import 'api_exception.dart';

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(ref.watch(secureTokenStoreProvider));
});

class ApiClient {
  ApiClient(this._tokenStore)
    : server = Dio(
        BaseOptions(
          baseUrl: _serverBaseUrl,
          connectTimeout: const Duration(seconds: 20),
          receiveTimeout: const Duration(seconds: 50),
          sendTimeout: const Duration(seconds: 50),
        ),
      ),
      ai = Dio(
        BaseOptions(
          baseUrl: _aiBaseUrl,
          connectTimeout: const Duration(seconds: 20),
          receiveTimeout: const Duration(seconds: 50),
          sendTimeout: const Duration(seconds: 50),
        ),
      ) {
    server.interceptors.add(_AuthInterceptor(this, _tokenStore));
  }

  final SecureTokenStore _tokenStore;
  final Dio server;
  final Dio ai;

  Future<ApiResponse<T>> parseResponse<T>(
    Response<dynamic> response,
    T Function(Object? json) parseData,
  ) async {
    final body = response.data;
    if (body is! Map<String, dynamic>) {
      throw const ApiException('服务器返回格式异常');
    }
    final parsed = ApiResponse<T>.fromJson(body, parseData);
    if (!parsed.success) {
      throw ApiException(parsed.message, statusCode: parsed.code);
    }
    return parsed;
  }

  Future<TokenPair?> refreshToken(TokenPair token) async {
    final response = await Dio(
      BaseOptions(baseUrl: _serverBaseUrl),
    ).post('/user/refresh-token', data: {'refreshToken': token.refreshToken});
    final parsed = await parseResponse<TokenPair>(response, TokenPair.fromJson);
    if (!parsed.data.isValid) return null;
    await _tokenStore.writeToken(parsed.data);
    return parsed.data;
  }

  static String get socketUrl {
    if (!kIsWeb && Platform.isAndroid) return AppEnv.androidSocketUrl;
    return AppEnv.socketUrl;
  }

  static String get uploadBaseUrl => AppEnv.uploadBaseUrl;

  static String get _serverBaseUrl {
    if (!kIsWeb && Platform.isAndroid) return AppEnv.androidApiBaseUrl;
    return AppEnv.apiBaseUrl;
  }

  static String get _aiBaseUrl {
    if (!kIsWeb && Platform.isAndroid) return AppEnv.androidAiBaseUrl;
    return AppEnv.aiBaseUrl;
  }
}

class _AuthInterceptor extends Interceptor {
  _AuthInterceptor(this._apiClient, this._tokenStore);

  final ApiClient _apiClient;
  final SecureTokenStore _tokenStore;
  Future<TokenPair?>? _refreshing;

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _tokenStore.readToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer ${token.accessToken}';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final statusCode = err.response?.statusCode;
    final alreadyRetried = err.requestOptions.extra['retried'] == true;
    if (statusCode != 401 || alreadyRetried) {
      handler.next(err);
      return;
    }

    final currentToken = await _tokenStore.readToken();
    if (currentToken == null) {
      await _tokenStore.clear();
      handler.next(err);
      return;
    }

    try {
      _refreshing ??= _apiClient.refreshToken(currentToken);
      final nextToken = await _refreshing;
      _refreshing = null;
      if (nextToken == null) {
        await _tokenStore.clear();
        handler.next(err);
        return;
      }

      final requestOptions = err.requestOptions;
      requestOptions.extra['retried'] = true;
      requestOptions.headers['Authorization'] =
          'Bearer ${nextToken.accessToken}';
      final response = await _apiClient.server.fetch<dynamic>(requestOptions);
      handler.resolve(response);
    } catch (_) {
      _refreshing = null;
      await _tokenStore.clear();
      handler.next(err);
    }
  }
}
