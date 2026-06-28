import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/ui/app_empty_state.dart';
import '../../word_book/domain/word.dart';
import '../application/learn_controller.dart';
import '../data/word_tts_service.dart';

class LearnScreen extends ConsumerStatefulWidget {
  const LearnScreen({required this.courseId, required this.title, super.key});

  final String courseId;
  final String title;

  @override
  ConsumerState<LearnScreen> createState() => _LearnScreenState();
}

class _LearnScreenState extends ConsumerState<LearnScreen> {
  final Set<String> _selectedWordIds = {};

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(learnControllerProvider.notifier).load(widget.courseId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(learnControllerProvider);

    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: RefreshIndicator(
        onRefresh: () =>
            ref.read(learnControllerProvider.notifier).load(widget.courseId),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (state.error != null)
              Card(
                color: Theme.of(context).colorScheme.errorContainer,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text(
                    state.error!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onErrorContainer,
                    ),
                  ),
                ),
              ),
            if (state.message != null)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text(state.message!),
                ),
              ),
            if (state.isLoading)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 48),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (state.words.isEmpty)
              const AppEmptyState(
                icon: Icons.celebration_outlined,
                title: '本轮完成',
                message: '当前课程暂时没有新的待学单词。',
              )
            else ...[
              Text(
                '选择已经掌握的单词，提交后会进入你的单词记录。',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 12),
              for (final word in state.words) ...[
                _WordLearnCard(
                  word: word,
                  isSelected: _selectedWordIds.contains(word.id),
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        _selectedWordIds.add(word.id);
                      } else {
                        _selectedWordIds.remove(word.id);
                      }
                    });
                  },
                  onSpeak: () =>
                      ref.read(wordTtsServiceProvider).speak(word.word),
                ),
                const SizedBox(height: 12),
              ],
              FilledButton.icon(
                onPressed: state.isSaving || _selectedWordIds.isEmpty
                    ? null
                    : () async {
                        final selected = Set<String>.from(_selectedWordIds);
                        await ref
                            .read(learnControllerProvider.notifier)
                            .saveMastered(widget.courseId, selected);
                        setState(_selectedWordIds.clear);
                      },
                icon: state.isSaving
                    ? const SizedBox.square(
                        dimension: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.check_circle_outline),
                label: Text('提交已掌握（${_selectedWordIds.length}）'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _WordLearnCard extends StatelessWidget {
  const _WordLearnCard({
    required this.word,
    required this.isSelected,
    required this.onSelected,
    required this.onSpeak,
  });

  final Word word;
  final bool isSelected;
  final ValueChanged<bool> onSelected;
  final VoidCallback onSpeak;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(word.word, style: textTheme.headlineSmall),
                      if (word.phonetic?.isNotEmpty == true)
                        Text('[${word.phonetic}]'),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: onSpeak,
                  icon: const Icon(Icons.volume_up_outlined),
                  tooltip: '发音',
                ),
                Checkbox(value: isSelected, onChanged: (v) => onSelected(v!)),
              ],
            ),
            if (word.translation?.isNotEmpty == true) ...[
              const SizedBox(height: 8),
              Text(word.translation!),
            ],
            if (word.definition?.isNotEmpty == true) ...[
              const SizedBox(height: 8),
              Text(word.definition!),
            ],
          ],
        ),
      ),
    );
  }
}
