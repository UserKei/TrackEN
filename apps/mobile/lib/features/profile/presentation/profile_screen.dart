import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/network/api_client.dart';
import '../../../core/ui/app_section.dart';
import '../../auth/application/auth_controller.dart';
import '../../auth/domain/app_user.dart';

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
          if (authState.isLoading) const LinearProgressIndicator(),
          if (authState.error != null)
            Card(
              color: Theme.of(context).colorScheme.errorContainer,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Text(
                  authState.error!,
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onErrorContainer,
                  ),
                ),
              ),
            ),
          if (!authState.isLoading && user == null)
            _GuestPanel(onLogin: () => context.push('/auth'))
          else if (user != null)
            _UserPanel(
              user: user,
              onEdit: () => _showEditSheet(context, ref, user),
              onUploadAvatar: () => _pickAndUploadAvatar(context, ref),
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

  Future<void> _pickAndUploadAvatar(BuildContext context, WidgetRef ref) async {
    final picker = ImagePicker();
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('从相册选择'),
              onTap: () => Navigator.of(context).pop(ImageSource.gallery),
            ),
            ListTile(
              leading: const Icon(Icons.photo_camera_outlined),
              title: const Text('拍照'),
              onTap: () => Navigator.of(context).pop(ImageSource.camera),
            ),
          ],
        ),
      ),
    );
    if (source == null) return;

    final picked = await picker.pickImage(source: source, imageQuality: 88);
    if (picked == null) return;
    final cropped = await ImageCropper().cropImage(
      sourcePath: picked.path,
      maxWidth: 768,
      maxHeight: 768,
      compressQuality: 88,
    );
    if (cropped == null) return;

    await ref.read(authControllerProvider.notifier).uploadAvatar(cropped.path);
  }

  Future<void> _showEditSheet(
    BuildContext context,
    WidgetRef ref,
    AppUser user,
  ) async {
    final nameController = TextEditingController(text: user.name);
    final emailController = TextEditingController(text: user.email ?? '');
    final addressController = TextEditingController(text: user.address ?? '');
    final bioController = TextEditingController(text: user.bio ?? '');
    final timeController = TextEditingController(text: user.timingTaskTime);
    var isTimingTask = user.isTimingTask;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return SafeArea(
              child: Padding(
                padding: EdgeInsets.only(
                  left: 16,
                  right: 16,
                  top: 16,
                  bottom: MediaQuery.viewInsetsOf(context).bottom + 16,
                ),
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        '编辑资料',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: nameController,
                        decoration: const InputDecoration(labelText: '姓名'),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: emailController,
                        decoration: const InputDecoration(labelText: '邮箱'),
                        keyboardType: TextInputType.emailAddress,
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: addressController,
                        decoration: const InputDecoration(labelText: '地址'),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: bioController,
                        decoration: const InputDecoration(labelText: '签名'),
                        maxLines: 3,
                      ),
                      const SizedBox(height: 12),
                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        value: isTimingTask,
                        onChanged: (value) {
                          setSheetState(() => isTimingTask = value);
                        },
                        title: const Text('开启定时任务'),
                      ),
                      TextField(
                        controller: timeController,
                        decoration: const InputDecoration(
                          labelText: '定时任务时间',
                          hintText: '00:00:00',
                        ),
                      ),
                      const SizedBox(height: 16),
                      FilledButton.icon(
                        onPressed: () async {
                          await ref
                              .read(authControllerProvider.notifier)
                              .updateProfile(
                                name: nameController.text.trim(),
                                email: emailController.text.trim(),
                                address: addressController.text.trim(),
                                bio: bioController.text.trim(),
                                isTimingTask: isTimingTask,
                                timingTaskTime: timeController.text.trim(),
                              );
                          if (context.mounted) Navigator.of(context).pop();
                        },
                        icon: const Icon(Icons.save_outlined),
                        label: const Text('保存'),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );

    nameController.dispose();
    emailController.dispose();
    addressController.dispose();
    bioController.dispose();
    timeController.dispose();
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
    required this.user,
    required this.onEdit,
    required this.onUploadAvatar,
    required this.onLogout,
  });

  final AppUser user;
  final VoidCallback onEdit;
  final VoidCallback onUploadAvatar;
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
                GestureDetector(
                  onTap: onUploadAvatar,
                  child: Stack(
                    children: [
                      _Avatar(user: user),
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.primary,
                            shape: BoxShape.circle,
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(4),
                            child: Icon(
                              Icons.edit,
                              size: 14,
                              color: Theme.of(context).colorScheme.onPrimary,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.name,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user.email?.isNotEmpty == true
                            ? user.email!
                            : user.phone,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _Metric(label: '打卡', value: '${user.dayNumber} 天'),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _Metric(label: '单词', value: '${user.wordNumber} 个'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: onEdit,
                    icon: const Icon(Icons.edit_outlined),
                    label: const Text('编辑资料'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onLogout,
                    icon: const Icon(Icons.logout),
                    label: const Text('退出'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar({required this.user});

  final AppUser user;

  @override
  Widget build(BuildContext context) {
    final avatarUrl = _resolveAvatarUrl(user.avatar);
    if (avatarUrl == null) {
      return CircleAvatar(
        radius: 32,
        child: Text(user.name.isEmpty ? 'T' : user.name.substring(0, 1)),
      );
    }

    return CircleAvatar(
      radius: 32,
      backgroundImage: CachedNetworkImageProvider(avatarUrl),
    );
  }

  String? _resolveAvatarUrl(String? raw) {
    if (raw == null || raw.isEmpty) return null;
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    if (raw.startsWith('/')) return '${ApiClient.uploadBaseUrl}$raw';
    return '${ApiClient.uploadBaseUrl}/$raw';
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
