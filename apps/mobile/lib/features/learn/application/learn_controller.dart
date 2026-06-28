import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../word_book/domain/word.dart';
import '../data/learn_repository.dart';

final learnControllerProvider = NotifierProvider<LearnController, LearnState>(
  LearnController.new,
);

class LearnState {
  const LearnState({
    required this.words,
    required this.isLoading,
    required this.isSaving,
    this.message,
    this.error,
  });

  const LearnState.initial()
    : words = const [],
      isLoading = true,
      isSaving = false,
      message = null,
      error = null;

  final List<Word> words;
  final bool isLoading;
  final bool isSaving;
  final String? message;
  final String? error;

  LearnState copyWith({
    List<Word>? words,
    bool? isLoading,
    bool? isSaving,
    String? message,
    String? error,
    bool clearMessage = false,
    bool clearError = false,
  }) {
    return LearnState(
      words: words ?? this.words,
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      message: clearMessage ? null : message ?? this.message,
      error: clearError ? null : error ?? this.error,
    );
  }
}

class LearnController extends Notifier<LearnState> {
  LearnRepository get _repository => ref.read(learnRepositoryProvider);

  @override
  LearnState build() => const LearnState.initial();

  Future<void> load(String courseId) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final words = await _repository.getWords(courseId);
      state = state.copyWith(words: words, isLoading: false);
    } catch (error) {
      state = state.copyWith(isLoading: false, error: error.toString());
    }
  }

  Future<void> saveMastered(String courseId, Set<String> wordIds) async {
    if (wordIds.isEmpty) return;
    state = state.copyWith(
      isSaving: true,
      clearError: true,
      clearMessage: true,
    );
    try {
      final wordNumber = await _repository.saveMastered(wordIds.toList());
      final words = await _repository.getWords(courseId);
      state = state.copyWith(
        words: words,
        isSaving: false,
        message: '已掌握 ${wordIds.length} 个单词，累计 $wordNumber 个',
      );
    } catch (error) {
      state = state.copyWith(isSaving: false, error: error.toString());
    }
  }
}
