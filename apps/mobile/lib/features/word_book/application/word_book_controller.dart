import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/word_book_repository.dart';
import '../domain/word.dart';

final wordBookControllerProvider =
    NotifierProvider<WordBookController, WordBookState>(WordBookController.new);

class WordBookState {
  const WordBookState({
    required this.words,
    required this.total,
    required this.page,
    required this.pageSize,
    required this.isLoading,
    this.keyword = '',
    this.tag,
    this.error,
  });

  const WordBookState.initial()
    : words = const [],
      total = 0,
      page = 1,
      pageSize = 20,
      isLoading = true,
      keyword = '',
      tag = null,
      error = null;

  final List<Word> words;
  final int total;
  final int page;
  final int pageSize;
  final bool isLoading;
  final String keyword;
  final String? tag;
  final String? error;

  int get pageCount => (total / pageSize).ceil().clamp(1, 999999);

  WordBookState copyWith({
    List<Word>? words,
    int? total,
    int? page,
    int? pageSize,
    bool? isLoading,
    String? keyword,
    String? tag,
    String? error,
    bool clearTag = false,
    bool clearError = false,
  }) {
    return WordBookState(
      words: words ?? this.words,
      total: total ?? this.total,
      page: page ?? this.page,
      pageSize: pageSize ?? this.pageSize,
      isLoading: isLoading ?? this.isLoading,
      keyword: keyword ?? this.keyword,
      tag: clearTag ? null : tag ?? this.tag,
      error: clearError ? null : error ?? this.error,
    );
  }
}

class WordBookController extends Notifier<WordBookState> {
  WordBookRepository get _repository => ref.read(wordBookRepositoryProvider);

  @override
  WordBookState build() {
    Future.microtask(load);
    return const WordBookState.initial();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final page = await _repository.getWords(
        page: state.page,
        pageSize: state.pageSize,
        keyword: state.keyword,
        tag: state.tag,
      );
      state = state.copyWith(
        words: page.list,
        total: page.total,
        isLoading: false,
      );
    } catch (error) {
      state = state.copyWith(isLoading: false, error: error.toString());
    }
  }

  Future<void> search(String keyword) async {
    state = state.copyWith(keyword: keyword.trim(), page: 1);
    await load();
  }

  Future<void> setTag(String? tag) async {
    state = state.copyWith(tag: tag, clearTag: tag == null, page: 1);
    await load();
  }

  Future<void> nextPage() async {
    if (state.page >= state.pageCount) return;
    state = state.copyWith(page: state.page + 1);
    await load();
  }

  Future<void> previousPage() async {
    if (state.page <= 1) return;
    state = state.copyWith(page: state.page - 1);
    await load();
  }
}
