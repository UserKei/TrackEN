enum ChatRoleType {
  normal,
  master,
  business,
  qilinge,
  xiaoman;

  static ChatRoleType fromJson(Object? value) {
    final raw = value as String? ?? 'normal';
    return ChatRoleType.values.firstWhere(
      (role) => role.name == raw,
      orElse: () => ChatRoleType.normal,
    );
  }
}

class ChatMode {
  const ChatMode({required this.id, required this.label, required this.role});

  final String id;
  final String label;
  final ChatRoleType role;

  factory ChatMode.fromJson(Object? json) {
    final map = json as Map<String, dynamic>? ?? const {};
    return ChatMode(
      id: map['id'] as String? ?? '',
      label: map['label'] as String? ?? '',
      role: ChatRoleType.fromJson(map['role']),
    );
  }
}

class ChatMessage {
  const ChatMessage({
    required this.role,
    required this.content,
    required this.type,
    this.reasoning = '',
  });

  final String role;
  final String content;
  final String type;
  final String reasoning;

  bool get isHuman => role == 'human';

  factory ChatMessage.fromJson(Object? json) {
    final map = json as Map<String, dynamic>? ?? const {};
    return ChatMessage(
      role: map['role'] as String? ?? 'ai',
      content: map['content'] as String? ?? '',
      reasoning: map['reasoning'] as String? ?? '',
      type: map['type'] as String? ?? 'chat',
    );
  }
}

class ChatChunk {
  const ChatChunk({required this.content, required this.type});

  final String content;
  final String type;

  factory ChatChunk.fromJson(Object? json) {
    final map = json as Map<String, dynamic>? ?? const {};
    return ChatChunk(
      content: map['content'] as String? ?? '',
      type: map['type'] as String? ?? 'chat',
    );
  }
}
