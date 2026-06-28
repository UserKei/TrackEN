class Word {
  const Word({
    required this.id,
    required this.word,
    this.phonetic,
    this.definition,
    this.translation,
    this.pos,
    this.collins,
    this.oxford,
    this.tag,
    this.bnc,
    this.frq,
    this.exchange,
    this.gk,
    this.zk,
    this.gre,
    this.toefl,
    this.ielts,
    this.cet6,
    this.cet4,
    this.ky,
  });

  final String id;
  final String word;
  final String? phonetic;
  final String? definition;
  final String? translation;
  final String? pos;
  final String? collins;
  final String? oxford;
  final String? tag;
  final String? bnc;
  final String? frq;
  final String? exchange;
  final bool? gk;
  final bool? zk;
  final bool? gre;
  final bool? toefl;
  final bool? ielts;
  final bool? cet6;
  final bool? cet4;
  final bool? ky;

  factory Word.fromJson(Object? json) {
    final map = json as Map<String, dynamic>? ?? const {};
    return Word(
      id: map['id'] as String? ?? '',
      word: map['word'] as String? ?? '',
      phonetic: map['phonetic'] as String?,
      definition: map['definition'] as String?,
      translation: map['translation'] as String?,
      pos: map['pos'] as String?,
      collins: map['collins'] as String?,
      oxford: map['oxford'] as String?,
      tag: map['tag'] as String?,
      bnc: map['bnc'] as String?,
      frq: map['frq'] as String?,
      exchange: map['exchange'] as String?,
      gk: map['gk'] as bool?,
      zk: map['zk'] as bool?,
      gre: map['gre'] as bool?,
      toefl: map['toefl'] as bool?,
      ielts: map['ielts'] as bool?,
      cet6: map['cet6'] as bool?,
      cet4: map['cet4'] as bool?,
      ky: map['ky'] as bool?,
    );
  }
}

class WordPage {
  const WordPage({required this.list, required this.total});

  final List<Word> list;
  final int total;

  factory WordPage.fromJson(Object? json) {
    final map = json as Map<String, dynamic>? ?? const {};
    return WordPage(
      list: (map['list'] as List<dynamic>? ?? const [])
          .map(Word.fromJson)
          .toList(growable: false),
      total: (map['total'] as num?)?.toInt() ?? 0,
    );
  }
}
