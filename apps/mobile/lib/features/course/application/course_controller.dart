import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/domain/app_user.dart';
import '../../payment/data/native_payment_service.dart';
import '../../payment/data/payment_socket_client.dart';
import '../data/course_repository.dart';
import '../domain/course.dart';

final courseControllerProvider =
    NotifierProvider<CourseController, CourseState>(CourseController.new);

class CourseState {
  const CourseState({
    required this.courses,
    required this.myCourses,
    required this.isLoading,
    this.payingCourseId,
    this.message,
    this.error,
  });

  const CourseState.initial()
    : courses = const [],
      myCourses = const [],
      isLoading = true,
      payingCourseId = null,
      message = null,
      error = null;

  final List<Course> courses;
  final List<Course> myCourses;
  final bool isLoading;
  final String? payingCourseId;
  final String? message;
  final String? error;

  Set<String> get purchasedIds => myCourses.map((course) => course.id).toSet();

  CourseState copyWith({
    List<Course>? courses,
    List<Course>? myCourses,
    bool? isLoading,
    String? payingCourseId,
    String? message,
    String? error,
    bool clearPaying = false,
    bool clearMessage = false,
    bool clearError = false,
  }) {
    return CourseState(
      courses: courses ?? this.courses,
      myCourses: myCourses ?? this.myCourses,
      isLoading: isLoading ?? this.isLoading,
      payingCourseId: clearPaying
          ? null
          : payingCourseId ?? this.payingCourseId,
      message: clearMessage ? null : message ?? this.message,
      error: clearError ? null : error ?? this.error,
    );
  }
}

class CourseController extends Notifier<CourseState> {
  CourseRepository get _repository => ref.read(courseRepositoryProvider);
  NativePaymentService get _paymentService =>
      ref.read(nativePaymentServiceProvider);
  PaymentSocketClient get _socket => ref.read(paymentSocketClientProvider);

  StreamSubscription<void>? _paymentSubscription;

  @override
  CourseState build() {
    ref.onDispose(() => _paymentSubscription?.cancel());
    Future.microtask(() => load(isAuthenticated: false));
    return const CourseState.initial();
  }

  Future<void> load({required bool isAuthenticated}) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final courses = await _repository.getCourses();
      final myCourses = isAuthenticated
          ? await _repository.getMyCourses()
          : const <Course>[];
      state = state.copyWith(
        courses: courses,
        myCourses: myCourses,
        isLoading: false,
      );
    } catch (error) {
      state = state.copyWith(isLoading: false, error: error.toString());
    }
  }

  Future<void> purchase({
    required Course course,
    required UserSession session,
  }) async {
    state = state.copyWith(
      payingCourseId: course.id,
      clearError: true,
      clearMessage: true,
    );
    _connectPaymentSocket(session);

    try {
      final order = await _repository.createAppPayment(course);
      final orderInfo = order.orderInfo;
      if (orderInfo == null || orderInfo.isEmpty) {
        throw StateError('服务端未返回 App Pay orderInfo');
      }

      final result = await _paymentService.pay(orderInfo);
      state = state.copyWith(
        message: result.isSubmitted ? '支付结果确认中' : '支付已取消或未完成',
        clearPaying: true,
      );
      await load(isAuthenticated: true);
    } catch (error) {
      state = state.copyWith(error: error.toString(), clearPaying: true);
    }
  }

  void _connectPaymentSocket(UserSession session) {
    _socket.connect(session.user.id);
    _paymentSubscription ??= _socket.paymentSuccess.listen((_) async {
      state = state.copyWith(message: '支付成功，课程已解锁');
      await load(isAuthenticated: true);
    });
  }
}
