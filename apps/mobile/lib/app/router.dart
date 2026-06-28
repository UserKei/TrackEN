import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/presentation/auth_screen.dart';
import '../features/chat/presentation/chat_screen.dart';
import '../features/course/presentation/course_screen.dart';
import '../features/home/presentation/home_screen.dart';
import '../features/learn/presentation/learn_screen.dart';
import '../features/profile/presentation/profile_screen.dart';
import '../features/word_book/presentation/word_book_screen.dart';
import 'app_shell.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/auth',
        name: 'auth',
        builder: (context, state) => const AuthScreen(),
      ),
      GoRoute(
        path: '/learn/:courseId/:title',
        name: 'learn',
        builder: (context, state) => LearnScreen(
          courseId: state.pathParameters['courseId'] ?? '',
          title: state.pathParameters['title'] ?? '学习',
        ),
      ),
      GoRoute(
        path: '/word-book',
        name: 'word-book',
        builder: (context, state) => const WordBookScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return TrackEnShell(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/',
                name: 'home',
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/courses',
                name: 'courses',
                builder: (context, state) => const CourseScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/chat',
                name: 'chat',
                builder: (context, state) => const ChatScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                name: 'profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
