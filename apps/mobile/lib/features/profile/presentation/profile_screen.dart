import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('我的')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          FilledButton.icon(
            onPressed: () => context.push('/auth'),
            icon: const Icon(Icons.login),
            label: const Text('登录 / 注册'),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () => context.push('/word-book'),
            icon: const Icon(Icons.bookmarks),
            label: const Text('我的单词本'),
          ),
        ],
      ),
    );
  }
}
