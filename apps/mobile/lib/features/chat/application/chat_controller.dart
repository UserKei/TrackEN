import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/chat_repository.dart';
import '../domain/chat_models.dart';

final chatControllerProvider = NotifierProvider<ChatController, ChatState>(
  ChatController.new,
);

class ChatState {
  const ChatState({
    required this.modes,
    required this.messages,
    required this.isLoading,
    required this.isStreaming,
    required this.deepThink,
    required this.webSearch,
    this.selectedRole = ChatRoleType.normal,
    this.error,
  });

  const ChatState.initial()
    : modes = const [],
      messages = const [],
      isLoading = true,
      isStreaming = false,
      deepThink = false,
      webSearch = false,
      selectedRole = ChatRoleType.normal,
      error = null;

  final List<ChatMode> modes;
  final List<ChatMessage> messages;
  final bool isLoading;
  final bool isStreaming;
  final bool deepThink;
  final bool webSearch;
  final ChatRoleType selectedRole;
  final String? error;

  ChatState copyWith({
    List<ChatMode>? modes,
    List<ChatMessage>? messages,
    bool? isLoading,
    bool? isStreaming,
    bool? deepThink,
    bool? webSearch,
    ChatRoleType? selectedRole,
    String? error,
    bool clearError = false,
  }) {
    return ChatState(
      modes: modes ?? this.modes,
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      isStreaming: isStreaming ?? this.isStreaming,
      deepThink: deepThink ?? this.deepThink,
      webSearch: webSearch ?? this.webSearch,
      selectedRole: selectedRole ?? this.selectedRole,
      error: clearError ? null : error ?? this.error,
    );
  }
}

class ChatController extends Notifier<ChatState> {
  ChatRepository get _repository => ref.read(chatRepositoryProvider);

  StreamSubscription<ChatChunk>? _streamSubscription;

  @override
  ChatState build() {
    ref.onDispose(() => _streamSubscription?.cancel());
    Future.microtask(loadModes);
    return const ChatState.initial();
  }

  Future<void> loadModes() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final modes = await _repository.getModes();
      state = state.copyWith(modes: modes, isLoading: false);
    } catch (error) {
      state = state.copyWith(isLoading: false, error: error.toString());
    }
  }

  Future<void> loadHistory(String userId) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final messages = await _repository.getHistory(
        userId: userId,
        role: state.selectedRole,
      );
      state = state.copyWith(messages: messages, isLoading: false);
    } catch (error) {
      state = state.copyWith(isLoading: false, error: error.toString());
    }
  }

  Future<void> selectRole(ChatRoleType role, String userId) async {
    state = state.copyWith(selectedRole: role);
    await loadHistory(userId);
  }

  void setDeepThink(bool value) {
    state = state.copyWith(deepThink: value);
  }

  void setWebSearch(bool value) {
    state = state.copyWith(webSearch: value);
  }

  Future<void> send({required String userId, required String content}) async {
    final trimmed = content.trim();
    if (trimmed.isEmpty || state.isStreaming) return;

    final baseMessages = [
      ...state.messages,
      ChatMessage(role: 'human', content: trimmed, type: 'chat'),
    ];
    state = state.copyWith(
      messages: [
        ...baseMessages,
        const ChatMessage(role: 'ai', content: '', type: 'chat'),
      ],
      isStreaming: true,
      clearError: true,
    );

    var assistantContent = '';
    var assistantReasoning = '';

    try {
      final stream = await _repository.streamChat(
        userId: userId,
        role: state.selectedRole,
        content: trimmed,
        deepThink: state.deepThink,
        webSearch: state.webSearch,
      );
      await _streamSubscription?.cancel();
      _streamSubscription = stream.listen(
        (chunk) {
          if (chunk.type == 'reasoning') {
            assistantReasoning += chunk.content;
          } else {
            assistantContent += chunk.content;
          }
          state = state.copyWith(
            messages: [
              ...baseMessages,
              ChatMessage(
                role: 'ai',
                content: assistantContent,
                reasoning: assistantReasoning,
                type: 'chat',
              ),
            ],
          );
        },
        onError: (Object error) {
          state = state.copyWith(isStreaming: false, error: error.toString());
        },
        onDone: () {
          state = state.copyWith(isStreaming: false);
        },
      );
    } catch (error) {
      state = state.copyWith(isStreaming: false, error: error.toString());
    }
  }
}
