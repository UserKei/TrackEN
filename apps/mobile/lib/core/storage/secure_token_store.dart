import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../features/auth/domain/app_user.dart';
import '../../features/auth/domain/token_pair.dart';

final secureTokenStoreProvider = Provider<SecureTokenStore>((ref) {
  return SecureTokenStore(const FlutterSecureStorage());
});

class SecureTokenStore {
  const SecureTokenStore(this._storage);

  static const _accessTokenKey = 'tracken.accessToken';
  static const _refreshTokenKey = 'tracken.refreshToken';
  static const _userKey = 'tracken.user';

  final FlutterSecureStorage _storage;

  Future<TokenPair?> readToken() async {
    try {
      final accessToken = await _storage.read(key: _accessTokenKey);
      final refreshToken = await _storage.read(key: _refreshTokenKey);
      if (accessToken == null || refreshToken == null) return null;
      final token = TokenPair(
        accessToken: accessToken,
        refreshToken: refreshToken,
      );
      return token.isValid ? token : null;
    } catch (_) {
      return null;
    }
  }

  Future<AppUser?> readUser() async {
    try {
      final raw = await _storage.read(key: _userKey);
      if (raw == null || raw.isEmpty) return null;
      return AppUser.fromJson(jsonDecode(raw));
    } catch (_) {
      return null;
    }
  }

  Future<UserSession?> readSession() async {
    final token = await readToken();
    final user = await readUser();
    if (token == null || user == null) return null;
    return UserSession(user: user, token: token);
  }

  Future<void> writeSession(UserSession session) async {
    await writeToken(session.token);
    await writeUser(session.user);
  }

  Future<void> writeToken(TokenPair token) async {
    await _storage.write(key: _accessTokenKey, value: token.accessToken);
    await _storage.write(key: _refreshTokenKey, value: token.refreshToken);
  }

  Future<void> writeUser(AppUser user) async {
    await _storage.write(key: _userKey, value: jsonEncode(user.toJson()));
  }

  Future<void> clear() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
    await _storage.delete(key: _userKey);
  }
}
