import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/models/api_response.dart';

void main() {
  test('parses TrackEN response envelope', () {
    final response = ApiResponse.fromJson({
      'timestamp': '2026-06-28T00:00:00.000Z',
      'path': '/api/v1/course/list',
      'message': 'ok',
      'code': 200,
      'success': true,
      'data': {'value': 42},
    }, (json) => (json as Map<String, dynamic>)['value'] as int);

    expect(response.success, isTrue);
    expect(response.data, 42);
    expect(response.path, '/api/v1/course/list');
  });
}
