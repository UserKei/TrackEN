import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../domain/word.dart';

final wordBookRepositoryProvider = Provider<WordBookRepository>((ref) {
  return WordBookRepository(ref.watch(apiClientProvider));
});

class WordBookRepository {
  const WordBookRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<WordPage> getWords({
    required int page,
    required int pageSize,
    String? keyword,
    String? tag,
  }) async {
    final query = <String, dynamic>{
      'page': page,
      'pageSize': pageSize,
      if (keyword != null && keyword.isNotEmpty) 'word': keyword,
      ?tag: true,
    };
    final response = await _apiClient.server.get<dynamic>(
      '/word-book',
      queryParameters: query,
    );
    final parsed = await _apiClient.parseResponse<WordPage>(
      response,
      WordPage.fromJson,
    );
    return parsed.data;
  }
}
