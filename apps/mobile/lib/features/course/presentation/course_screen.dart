import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/api_client.dart';
import '../../../core/ui/app_empty_state.dart';
import '../../../core/ui/app_section.dart';
import '../../auth/application/auth_controller.dart';
import '../application/course_controller.dart';
import '../domain/course.dart';

class CourseScreen extends ConsumerStatefulWidget {
  const CourseScreen({super.key});

  @override
  ConsumerState<CourseScreen> createState() => _CourseScreenState();
}

class _CourseScreenState extends ConsumerState<CourseScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(_load);
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(authControllerProvider, (previous, next) {
      if (previous?.isAuthenticated != next.isAuthenticated) _load();
    });

    final authState = ref.watch(authControllerProvider);
    final courseState = ref.watch(courseControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('课程')),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (courseState.error != null)
              Card(
                color: Theme.of(context).colorScheme.errorContainer,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text(
                    courseState.error!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onErrorContainer,
                    ),
                  ),
                ),
              ),
            if (courseState.message != null)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text(courseState.message!),
                ),
              ),
            if (courseState.isLoading)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 48),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (courseState.courses.isEmpty)
              const AppEmptyState(
                icon: Icons.menu_book_outlined,
                title: '暂无课程',
                message: '课程列表为空，稍后再回来看看。',
              )
            else ...[
              if (authState.isAuthenticated &&
                  courseState.myCourses.isNotEmpty) ...[
                AppSection(
                  title: '我的课程',
                  child: _CourseList(
                    courses: courseState.myCourses,
                    purchasedIds: courseState.purchasedIds,
                    payingCourseId: courseState.payingCourseId,
                    onCourseAction: (course) => _openLearn(course),
                  ),
                ),
                const SizedBox(height: 24),
              ],
              AppSection(
                title: '全部课程',
                child: _CourseList(
                  courses: courseState.courses,
                  purchasedIds: courseState.purchasedIds,
                  payingCourseId: courseState.payingCourseId,
                  onCourseAction: (course) {
                    if (courseState.purchasedIds.contains(course.id)) {
                      _openLearn(course);
                      return;
                    }
                    if (!authState.isAuthenticated) {
                      context.push('/auth?from=/courses');
                      return;
                    }
                    ref
                        .read(courseControllerProvider.notifier)
                        .purchase(course: course, session: authState.session!);
                  },
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _load() {
    final authState = ref.read(authControllerProvider);
    return ref
        .read(courseControllerProvider.notifier)
        .load(isAuthenticated: authState.isAuthenticated);
  }

  void _openLearn(Course course) {
    context.pushNamed(
      'learn',
      pathParameters: {'courseId': course.id, 'title': course.name},
    );
  }
}

class _CourseList extends StatelessWidget {
  const _CourseList({
    required this.courses,
    required this.purchasedIds,
    required this.payingCourseId,
    required this.onCourseAction,
  });

  final List<Course> courses;
  final Set<String> purchasedIds;
  final String? payingCourseId;
  final ValueChanged<Course> onCourseAction;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (final course in courses) ...[
          _CourseCard(
            course: course,
            isPurchased: purchasedIds.contains(course.id),
            isPaying: payingCourseId == course.id,
            onAction: () => onCourseAction(course),
          ),
          const SizedBox(height: 12),
        ],
      ],
    );
  }
}

class _CourseCard extends StatelessWidget {
  const _CourseCard({
    required this.course,
    required this.isPurchased,
    required this.isPaying,
    required this.onAction,
  });

  final Course course;
  final bool isPurchased;
  final bool isPaying;
  final VoidCallback onAction;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: AspectRatio(
                aspectRatio: 16 / 9,
                child: _CourseImage(url: course.url),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(course.name, style: textTheme.titleMedium),
                      const SizedBox(height: 4),
                      Text('讲师：${course.teacher}'),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  '¥${course.price}',
                  style: textTheme.titleMedium?.copyWith(
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ],
            ),
            if (course.description.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(course.description, maxLines: 3),
            ],
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: isPaying ? null : onAction,
              icon: isPaying
                  ? const SizedBox.square(
                      dimension: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Icon(
                      isPurchased
                          ? Icons.play_circle_outline
                          : Icons.payments_outlined,
                    ),
              label: Text(isPurchased ? '开始学习' : '购买课程'),
            ),
          ],
        ),
      ),
    );
  }
}

class _CourseImage extends StatelessWidget {
  const _CourseImage({required this.url});

  final String url;

  @override
  Widget build(BuildContext context) {
    final resolved = _resolveUrl(url);
    if (resolved == null) {
      return ColoredBox(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        child: const Center(child: Icon(Icons.image_outlined, size: 48)),
      );
    }

    return CachedNetworkImage(
      imageUrl: resolved,
      fit: BoxFit.cover,
      errorWidget: (context, url, error) => ColoredBox(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        child: const Center(child: Icon(Icons.broken_image_outlined, size: 48)),
      ),
      placeholder: (context, url) =>
          const Center(child: CircularProgressIndicator()),
    );
  }

  String? _resolveUrl(String raw) {
    if (raw.isEmpty) return null;
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    final base = ApiClient.uploadBaseUrl;
    if (raw.startsWith('/')) return '$base$raw';
    return '$base/$raw';
  }
}
