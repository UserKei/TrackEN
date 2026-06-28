import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../core/storage/secure_token_store.dart';
import '../domain/app_user.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    ref.watch(apiClientProvider),
    ref.watch(secureTokenStoreProvider),
  );
});

class AuthRepository {
  const AuthRepository(this._apiClient, this._tokenStore);

  final ApiClient _apiClient;
  final SecureTokenStore _tokenStore;

  Future<UserSession?> restoreSession() => _tokenStore.readSession();

  Future<UserSession> login({
    required String phone,
    required String password,
  }) async {
    final response = await _apiClient.server.post<dynamic>(
      '/user/login',
      data: {'phone': phone, 'password': password},
    );
    final parsed = await _apiClient.parseResponse<UserSession>(
      response,
      UserSession.fromJson,
    );
    await _tokenStore.writeSession(parsed.data);
    return parsed.data;
  }

  Future<UserSession> register({
    required String name,
    required String phone,
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.server.post<dynamic>(
      '/user/register',
      data: {
        'name': name,
        'phone': phone,
        'email': email,
        'password': password,
      },
    );
    final parsed = await _apiClient.parseResponse<UserSession>(
      response,
      UserSession.fromJson,
    );
    await _tokenStore.writeSession(parsed.data);
    return parsed.data;
  }

  Future<void> logout() => _tokenStore.clear();

  Future<String> uploadAvatar(String filePath) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath),
    });
    final response = await _apiClient.server.post<dynamic>(
      '/user/upload-avatar',
      data: formData,
    );
    final parsed = await _apiClient.parseResponse<String>(response, (json) {
      final map = json as Map<String, dynamic>? ?? const {};
      return map['databaseUrl'] as String? ?? '';
    });
    return parsed.data;
  }

  Future<AppUser> updateUser(AppUser user) async {
    final response = await _apiClient.server.post<dynamic>(
      '/user/update-user',
      data: {
        'name': user.name,
        'email': user.email,
        'address': user.address,
        'avatar': user.avatar,
        'bio': user.bio,
        'isTimingTask': user.isTimingTask,
        'timingTaskTime': user.timingTaskTime,
      },
    );
    final parsed = await _apiClient.parseResponse<AppUser>(
      response,
      (_) => user,
    );
    await _tokenStore.writeUser(parsed.data);
    return parsed.data;
  }
}
