class AppEnv {
  const AppEnv._();

  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:3000/api/v1',
  );

  static const androidApiBaseUrl = String.fromEnvironment(
    'ANDROID_API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000/api/v1',
  );

  static const aiBaseUrl = String.fromEnvironment(
    'AI_BASE_URL',
    defaultValue: 'http://127.0.0.1:3001/ai/v1',
  );

  static const androidAiBaseUrl = String.fromEnvironment(
    'ANDROID_AI_BASE_URL',
    defaultValue: 'http://10.0.2.2:3001/ai/v1',
  );

  static const socketUrl = String.fromEnvironment(
    'SOCKET_URL',
    defaultValue: 'http://127.0.0.1:3000',
  );

  static const androidSocketUrl = String.fromEnvironment(
    'ANDROID_SOCKET_URL',
    defaultValue: 'http://10.0.2.2:3000',
  );

  static const uploadBaseUrl = String.fromEnvironment(
    'UPLOAD_BASE_URL',
    defaultValue: 'http://127.0.0.1:9000',
  );
}
