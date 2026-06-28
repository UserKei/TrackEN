import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/chat/domain/chat_models.dart';

void main() {
  test('parses chat role type safely', () {
    expect(ChatRoleType.fromJson('business'), ChatRoleType.business);
    expect(ChatRoleType.fromJson('unknown'), ChatRoleType.normal);
  });

  test('parses streaming chat chunk', () {
    final chunk = ChatChunk.fromJson({
      'content': 'hello',
      'role': 'ai',
      'type': 'reasoning',
    });

    expect(chunk.content, 'hello');
    expect(chunk.type, 'reasoning');
  });
}
