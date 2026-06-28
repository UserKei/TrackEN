import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/auth_repository.dart';
import '../domain/app_user.dart';

final authControllerProvider = NotifierProvider<AuthController, AuthState>(
  AuthController.new,
);

class AuthState {
  const AuthState({
    required this.isLoading,
    this.session,
    this.error,
    this.didRestore = false,
  });

  const AuthState.initial()
    : isLoading = true,
      session = null,
      error = null,
      didRestore = false;

  final bool isLoading;
  final UserSession? session;
  final String? error;
  final bool didRestore;

  bool get isAuthenticated => session != null;
  AppUser? get user => session?.user;

  AuthState copyWith({
    bool? isLoading,
    UserSession? session,
    String? error,
    bool? didRestore,
    bool clearSession = false,
    bool clearError = false,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      session: clearSession ? null : session ?? this.session,
      error: clearError ? null : error ?? this.error,
      didRestore: didRestore ?? this.didRestore,
    );
  }
}

class AuthController extends Notifier<AuthState> {
  AuthRepository get _repository => ref.read(authRepositoryProvider);

  @override
  AuthState build() {
    Future.microtask(_restore);
    return const AuthState.initial();
  }

  Future<void> _restore() async {
    final session = await _repository.restoreSession();
    state = AuthState(isLoading: false, session: session, didRestore: true);
  }

  Future<void> login({required String phone, required String password}) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final session = await _repository.login(phone: phone, password: password);
      state = AuthState(isLoading: false, session: session, didRestore: true);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        error: error.toString(),
        clearSession: true,
      );
    }
  }

  Future<void> register({
    required String name,
    required String phone,
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final session = await _repository.register(
        name: name,
        phone: phone,
        email: email,
        password: password,
      );
      state = AuthState(isLoading: false, session: session, didRestore: true);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        error: error.toString(),
        clearSession: true,
      );
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    state = const AuthState(isLoading: false, didRestore: true);
  }

  Future<void> updateProfile({
    required String name,
    required String email,
    required String address,
    required String bio,
    required bool isTimingTask,
    required String timingTaskTime,
  }) async {
    final user = state.user;
    final token = state.session?.token;
    if (user == null || token == null) return;

    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final updated = await _repository.updateUser(
        user.copyWith(
          name: name,
          email: email,
          address: address,
          bio: bio,
          isTimingTask: isTimingTask,
          timingTaskTime: timingTaskTime,
        ),
      );
      state = AuthState(
        isLoading: false,
        session: UserSession(user: updated, token: token),
        didRestore: true,
      );
    } catch (error) {
      state = state.copyWith(isLoading: false, error: error.toString());
    }
  }

  Future<void> uploadAvatar(String filePath) async {
    final user = state.user;
    final token = state.session?.token;
    if (user == null || token == null) return;

    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final avatar = await _repository.uploadAvatar(filePath);
      final updated = await _repository.updateUser(
        user.copyWith(avatar: avatar),
      );
      state = AuthState(
        isLoading: false,
        session: UserSession(user: updated, token: token),
        didRestore: true,
      );
    } catch (error) {
      state = state.copyWith(isLoading: false, error: error.toString());
    }
  }
}
