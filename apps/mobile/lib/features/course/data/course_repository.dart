import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../payment/domain/payment_order.dart';
import '../domain/course.dart';

final courseRepositoryProvider = Provider<CourseRepository>((ref) {
  return CourseRepository(ref.watch(apiClientProvider));
});

class CourseRepository {
  const CourseRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<Course>> getCourses() async {
    final response = await _apiClient.server.get<dynamic>('/course/list');
    final parsed = await _apiClient.parseResponse<List<Course>>(
      response,
      (json) => (json as List<dynamic>? ?? const [])
          .map(Course.fromJson)
          .toList(growable: false),
    );
    return parsed.data;
  }

  Future<List<Course>> getMyCourses() async {
    final response = await _apiClient.server.get<dynamic>('/course/my');
    final parsed = await _apiClient.parseResponse<List<Course>>(
      response,
      (json) => (json as List<dynamic>? ?? const [])
          .map(Course.fromJson)
          .toList(growable: false),
    );
    return parsed.data;
  }

  Future<PaymentOrder> createAppPayment(Course course) async {
    final response = await _apiClient.server.post<dynamic>(
      '/pay/create',
      data: {
        'subject': course.name,
        'body': course.description,
        'total_amount': course.price,
        'courseId': course.id,
        'channel': 'app',
      },
    );
    final parsed = await _apiClient.parseResponse<PaymentOrder>(
      response,
      PaymentOrder.fromJson,
    );
    return parsed.data;
  }
}
