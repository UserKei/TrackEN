import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/word_book/domain/word.dart';

void main() {
  test('parses word page', () {
    final page = WordPage.fromJson({
      'total': 1,
      'list': [
        {'id': 'w1', 'word': 'track', 'translation': '追踪', 'cet4': true},
      ],
    });

    expect(page.total, 1);
    expect(page.list.single.word, 'track');
    expect(page.list.single.cet4, isTrue);
  });
}
