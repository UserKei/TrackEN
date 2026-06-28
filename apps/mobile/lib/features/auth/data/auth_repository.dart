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
}
