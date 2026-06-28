import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(title: const Text('TrackEN')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('英语学习工作台', style: textTheme.headlineSmall),
          const SizedBox(height: 8),
          Text('课程、单词、AI 对话和学习记录会集中在这里。', style: textTheme.bodyMedium),
          const SizedBox(height: 20),
          FilledButton.icon(
            onPressed: () => context.go('/courses'),
            icon: const Icon(Icons.menu_book),
            label: const Text('查看课程'),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () => context.go('/chat'),
            icon: const Icon(Icons.forum),
            label: const Text('开始 AI 对话'),
          ),
        ],
      ),
    );
  }
}
