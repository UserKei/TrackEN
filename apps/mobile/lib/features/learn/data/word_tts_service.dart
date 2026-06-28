import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_tts/flutter_tts.dart';

final wordTtsServiceProvider = Provider<WordTtsService>((ref) {
  return WordTtsService(FlutterTts());
});

class WordTtsService {
  const WordTtsService(this._tts);

  final FlutterTts _tts;

  Future<void> speak(String text) async {
    await _tts.setLanguage('en-US');
    await _tts.setSpeechRate(0.45);
    await _tts.speak(text);
  }
}
