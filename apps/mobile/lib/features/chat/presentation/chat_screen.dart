import 'package:flutter/material.dart';
import 'package:flutter_markdown_plus/flutter_markdown_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../auth/application/auth_controller.dart';
import '../application/chat_controller.dart';
import '../data/voice_input_service.dart';
import '../domain/chat_models.dart';

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _inputController = TextEditingController();
  final _scrollController = ScrollController();
  bool _isListening = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(_loadHistoryIfAuthenticated);
  }

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(authControllerProvider, (previous, next) {
      if (previous?.session?.user.id != next.session?.user.id) {
        _loadHistoryIfAuthenticated();
      }
    });
    ref.listen(
      chatControllerProvider.select((state) => state.messages.length),
      (_, _) {
        WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToEnd());
      },
    );

    final authState = ref.watch(authControllerProvider);
    final chatState = ref.watch(chatControllerProvider);

    if (!authState.isAuthenticated) {
      return Scaffold(
        appBar: AppBar(title: const Text('AI 对话')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.lock_outline, size: 48),
                const SizedBox(height: 16),
                const Text('登录后可以保存并同步对话记录'),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: () => context.push('/auth?from=/chat'),
                  icon: const Icon(Icons.login),
                  label: const Text('登录 / 注册'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI 对话'),
        actions: [
          IconButton(
            onPressed: _loadHistoryIfAuthenticated,
            icon: const Icon(Icons.refresh),
            tooltip: '刷新历史',
          ),
        ],
      ),
      body: Column(
        children: [
          _ChatToolbar(
            state: chatState,
            onRoleChanged: (role) {
              final userId = authState.session!.user.id;
              ref
                  .read(chatControllerProvider.notifier)
                  .selectRole(role, userId);
            },
            onDeepThinkChanged: (value) {
              ref.read(chatControllerProvider.notifier).setDeepThink(value);
            },
            onWebSearchChanged: (value) {
              ref.read(chatControllerProvider.notifier).setWebSearch(value);
            },
          ),
          if (chatState.error != null)
            MaterialBanner(
              content: Text(chatState.error!),
              actions: [
                TextButton(
                  onPressed: () =>
                      ref.read(chatControllerProvider.notifier).loadModes(),
                  child: const Text('重试'),
                ),
              ],
            ),
          Expanded(
            child: chatState.isLoading
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: chatState.messages.length,
                    itemBuilder: (context, index) {
                      return _ChatBubble(message: chatState.messages[index]);
                    },
                  ),
          ),
          _Composer(
            controller: _inputController,
            isStreaming: chatState.isStreaming,
            isListening: _isListening,
            onVoice: _toggleVoiceInput,
            onSend: () => _send(authState.session!.user.id),
          ),
        ],
      ),
    );
  }

  Future<void> _loadHistoryIfAuthenticated() async {
    final session = ref.read(authControllerProvider).session;
    if (session == null) return;
    await ref
        .read(chatControllerProvider.notifier)
        .loadHistory(session.user.id);
  }

  Future<void> _send(String userId) async {
    final text = _inputController.text;
    _inputController.clear();
    await ref
        .read(chatControllerProvider.notifier)
        .send(userId: userId, content: text);
  }

  Future<void> _toggleVoiceInput() async {
    final voice = ref.read(voiceInputServiceProvider);
    if (_isListening) {
      await voice.stop();
      setState(() => _isListening = false);
      return;
    }

    final started = await voice.listen((words) {
      _inputController
        ..text = words
        ..selection = TextSelection.collapsed(offset: words.length);
    });
    if (mounted) setState(() => _isListening = started);
  }

  void _scrollToEnd() {
    if (!_scrollController.hasClients) return;
    _scrollController.animateTo(
      _scrollController.position.maxScrollExtent,
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOut,
    );
  }
}

class _ChatToolbar extends StatelessWidget {
  const _ChatToolbar({
    required this.state,
    required this.onRoleChanged,
    required this.onDeepThinkChanged,
    required this.onWebSearchChanged,
  });

  final ChatState state;
  final ValueChanged<ChatRoleType> onRoleChanged;
  final ValueChanged<bool> onDeepThinkChanged;
  final ValueChanged<bool> onWebSearchChanged;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Theme.of(context).colorScheme.surface,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
        child: Column(
          children: [
            DropdownButtonFormField<ChatRoleType>(
              initialValue: state.selectedRole,
              decoration: const InputDecoration(
                labelText: '角色',
                prefixIcon: Icon(Icons.psychology_outlined),
              ),
              items: [
                for (final mode in state.modes)
                  DropdownMenuItem(value: mode.role, child: Text(mode.label)),
              ],
              onChanged: state.isStreaming
                  ? null
                  : (role) {
                      if (role != null) onRoleChanged(role);
                    },
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: SwitchListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    value: state.deepThink,
                    onChanged: state.isStreaming ? null : onDeepThinkChanged,
                    title: const Text('深度思考'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SwitchListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    value: state.webSearch,
                    onChanged: state.isStreaming ? null : onWebSearchChanged,
                    title: const Text('联网搜索'),
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

class _ChatBubble extends StatelessWidget {
  const _ChatBubble({required this.message});

  final ChatMessage message;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final isHuman = message.isHuman;

    return Align(
      alignment: isHuman ? Alignment.centerRight : Alignment.centerLeft,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.sizeOf(context).width * 0.82,
        ),
        child: Card(
          color: isHuman ? scheme.primaryContainer : scheme.surfaceContainerLow,
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (message.reasoning.isNotEmpty)
                  ExpansionTile(
                    tilePadding: EdgeInsets.zero,
                    childrenPadding: EdgeInsets.zero,
                    title: const Text('推理过程'),
                    children: [
                      MarkdownBody(data: message.reasoning),
                      const SizedBox(height: 8),
                    ],
                  ),
                MarkdownBody(
                  data: message.content.isEmpty ? '...' : message.content,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Composer extends StatelessWidget {
  const _Composer({
    required this.controller,
    required this.isStreaming,
    required this.isListening,
    required this.onVoice,
    required this.onSend,
  });

  final TextEditingController controller;
  final bool isStreaming;
  final bool isListening;
  final VoidCallback onVoice;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            IconButton.filledTonal(
              onPressed: isStreaming ? null : onVoice,
              icon: Icon(isListening ? Icons.stop : Icons.mic_none),
              tooltip: isListening ? '停止语音输入' : '语音输入',
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                controller: controller,
                minLines: 1,
                maxLines: 5,
                decoration: const InputDecoration(hintText: '输入消息'),
                textInputAction: TextInputAction.newline,
              ),
            ),
            const SizedBox(width: 8),
            IconButton.filled(
              onPressed: isStreaming ? null : onSend,
              icon: isStreaming
                  ? const SizedBox.square(
                      dimension: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.send),
              tooltip: '发送',
            ),
          ],
        ),
      ),
    );
  }
}
