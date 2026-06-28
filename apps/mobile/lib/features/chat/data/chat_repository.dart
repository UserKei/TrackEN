import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../domain/chat_models.dart';

final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  return ChatRepository(ref.watch(apiClientProvider));
});

class ChatRepository {
  const ChatRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<ChatMode>> getModes() async {
    final response = await _apiClient.ai.get<dynamic>('/prompt/list');
    final parsed = await _apiClient.parseResponse<List<ChatMode>>(
      response,
      (json) => (json as List<dynamic>? ?? const [])
          .map(ChatMode.fromJson)
          .toList(growable: false),
    );
    return parsed.data;
  }

  Future<List<ChatMessage>> getHistory({
    required String userId,
    required ChatRoleType role,
  }) async {
    final response = await _apiClient.ai.get<dynamic>(
      '/chat/history',
      queryParameters: {'userId': userId, 'role': role.name},
    );
    final parsed = await _apiClient.parseResponse<List<ChatMessage>>(
      response,
      (json) => (json as List<dynamic>? ?? const [])
          .map(ChatMessage.fromJson)
          .toList(growable: false),
    );
    return parsed.data;
  }

  Future<Stream<ChatChunk>> streamChat({
    required String userId,
    required ChatRoleType role,
    required String content,
    required bool deepThink,
    required bool webSearch,
  }) async {
    final response = await _apiClient.ai.post<ResponseBody>(
      '/chat',
      data: {
        'userId': userId,
        'role': role.name,
        'content': content,
        'deepThink': deepThink,
        'webSearch': webSearch,
      },
      options: Options(
        responseType: ResponseType.stream,
        headers: {'Accept': 'text/event-stream'},
      ),
    );

    final stream = response.data?.stream;
    if (stream == null) return const Stream.empty();

    return stream
        .cast<List<int>>()
        .transform(utf8.decoder)
        .transform(const LineSplitter())
        .where((line) => line.startsWith('data:'))
        .map((line) => line.substring(5).trim())
        .where((line) => line.isNotEmpty)
        .map((line) => ChatChunk.fromJson(jsonDecode(line)));
  }
}
