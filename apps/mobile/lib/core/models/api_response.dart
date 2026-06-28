class ApiResponse<T> {
  const ApiResponse({
    required this.timestamp,
    required this.path,
    required this.message,
    required this.code,
    required this.success,
    required this.data,
  });

  final String timestamp;
  final String path;
  final String message;
  final int code;
  final bool success;
  final T data;

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) parseData,
  ) {
    return ApiResponse<T>(
      timestamp: json['timestamp'] as String? ?? '',
      path: json['path'] as String? ?? '',
      message: json['message'] as String? ?? '',
      code: (json['code'] as num?)?.toInt() ?? 0,
      success: json['success'] as bool? ?? false,
      data: parseData(json['data']),
    );
  }
}
