import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/ui/app_empty_state.dart';
import '../application/word_book_controller.dart';
import '../domain/word.dart';

class WordBookScreen extends ConsumerStatefulWidget {
  const WordBookScreen({super.key});

  @override
  ConsumerState<WordBookScreen> createState() => _WordBookScreenState();
}

class _WordBookScreenState extends ConsumerState<WordBookScreen> {
  final _searchController = TextEditingController();

  static const _tags = {
    'gk': '高考',
    'zk': '中考',
    'cet4': '四级',
    'cet6': '六级',
    'ky': '考研',
    'toefl': 'TOEFL',
    'ielts': 'IELTS',
    'gre': 'GRE',
  };

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(wordBookControllerProvider);
    final controller = ref.read(wordBookControllerProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: const Text('单词本')),
      body: RefreshIndicator(
        onRefresh: controller.load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextField(
              controller: _searchController,
              decoration: InputDecoration(
                labelText: '搜索单词',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  onPressed: () {
                    _searchController.clear();
                    controller.search('');
                  },
                  icon: const Icon(Icons.clear),
                  tooltip: '清空',
                ),
              ),
              textInputAction: TextInputAction.search,
              onSubmitted: controller.search,
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                FilterChip(
                  label: const Text('全部'),
                  selected: state.tag == null,
                  onSelected: (_) => controller.setTag(null),
                ),
                for (final entry in _tags.entries)
                  FilterChip(
                    label: Text(entry.value),
                    selected: state.tag == entry.key,
                    onSelected: (_) => controller.setTag(entry.key),
                  ),
              ],
            ),
            const SizedBox(height: 16),
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
            if (state.isLoading)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 48),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (state.words.isEmpty)
              const AppEmptyState(
                icon: Icons.bookmarks_outlined,
                title: '没有找到单词',
                message: '换个关键词或分类再试试。',
              )
            else ...[
              for (final word in state.words) ...[
                _WordBookCard(word: word),
                const SizedBox(height: 12),
              ],
              Row(
                children: [
                  OutlinedButton.icon(
                    onPressed: state.page <= 1 ? null : controller.previousPage,
                    icon: const Icon(Icons.chevron_left),
                    label: const Text('上一页'),
                  ),
                  Expanded(
                    child: Text(
                      '${state.page} / ${state.pageCount}',
                      textAlign: TextAlign.center,
                    ),
                  ),
                  OutlinedButton.icon(
                    onPressed: state.page >= state.pageCount
                        ? null
                        : controller.nextPage,
                    icon: const Icon(Icons.chevron_right),
                    label: const Text('下一页'),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _WordBookCard extends StatelessWidget {
  const _WordBookCard({required this.word});

  final Word word;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: Text(word.word, style: textTheme.titleLarge)),
                if (word.pos?.isNotEmpty == true)
                  Chip(
                    label: Text(word.pos!),
                    visualDensity: VisualDensity.compact,
                  ),
              ],
            ),
            if (word.phonetic?.isNotEmpty == true) Text('[${word.phonetic}]'),
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
