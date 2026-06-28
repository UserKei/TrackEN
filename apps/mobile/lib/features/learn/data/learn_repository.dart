import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../word_book/domain/word.dart';

final learnRepositoryProvider = Provider<LearnRepository>((ref) {
  return LearnRepository(ref.watch(apiClientProvider));
});

class LearnRepository {
  const LearnRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<Word>> getWords(String courseId) async {
    final response = await _apiClient.server.get<dynamic>(
      '/learn/word/$courseId',
    );
    final parsed = await _apiClient.parseResponse<List<Word>>(
      response,
      (json) => (json as List<dynamic>? ?? const [])
          .map(Word.fromJson)
          .toList(growable: false),
    );
    return parsed.data;
  }

  Future<int> saveMastered(List<String> wordIds) async {
    final response = await _apiClient.server.post<dynamic>(
      '/learn/word/master',
      data: {'wordIds': wordIds},
    );
    final parsed = await _apiClient.parseResponse<int>(response, (json) {
      final map = json as Map<String, dynamic>? ?? const {};
      return (map['wordNumber'] as num?)?.toInt() ?? 0;
    });
    return parsed.data;
  }
}
