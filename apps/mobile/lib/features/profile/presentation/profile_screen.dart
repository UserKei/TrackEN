import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/ui/app_section.dart';
import '../../auth/application/auth_controller.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);
    final user = authState.user;

    return Scaffold(
      appBar: AppBar(title: const Text('我的')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (authState.isLoading)
            const LinearProgressIndicator()
          else if (user == null)
            _GuestPanel(onLogin: () => context.push('/auth'))
          else
            _UserPanel(
              name: user.name,
              phone: user.phone,
              email: user.email,
              dayNumber: user.dayNumber,
              wordNumber: user.wordNumber,
              onLogout: () =>
                  ref.read(authControllerProvider.notifier).logout(),
            ),
          const SizedBox(height: 20),
          AppSection(
            title: '学习工具',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                OutlinedButton.icon(
                  onPressed: () => context.push('/word-book'),
                  icon: const Icon(Icons.bookmarks),
                  label: const Text('我的单词本'),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () => context.go('/chat'),
                  icon: const Icon(Icons.forum),
                  label: const Text('AI 对话'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _GuestPanel extends StatelessWidget {
  const _GuestPanel({required this.onLogin});

  final VoidCallback onLogin;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('未登录', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            const Text('登录后可以同步课程、单词本和 AI 对话记录。'),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: onLogin,
              icon: const Icon(Icons.login),
              label: const Text('登录 / 注册'),
            ),
          ],
        ),
      ),
    );
  }
}

class _UserPanel extends StatelessWidget {
  const _UserPanel({
    required this.name,
    required this.phone,
    required this.dayNumber,
    required this.wordNumber,
    required this.onLogout,
    this.email,
  });

  final String name;
  final String phone;
  final String? email;
  final int dayNumber;
  final int wordNumber;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  child: Text(name.isEmpty ? 'T' : name.substring(0, 1)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name, style: Theme.of(context).textTheme.titleLarge),
                      const SizedBox(height: 4),
                      Text(email?.isNotEmpty == true ? email! : phone),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _Metric(label: '打卡', value: '$dayNumber 天'),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _Metric(label: '单词', value: '$wordNumber 个'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: onLogout,
              icon: const Icon(Icons.logout),
              label: const Text('退出登录'),
            ),
          ],
        ),
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: Theme.of(context).textTheme.labelMedium),
            const SizedBox(height: 4),
            Text(value, style: Theme.of(context).textTheme.titleMedium),
          ],
        ),
      ),
    );
  }
}
