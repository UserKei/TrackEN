import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:speech_to_text/speech_to_text.dart';

final voiceInputServiceProvider = Provider<VoiceInputService>((ref) {
  return VoiceInputService(SpeechToText());
});

class VoiceInputService {
  const VoiceInputService(this._speech);

  final SpeechToText _speech;

  Future<bool> listen(ValueChanged<String> onWords) async {
    final available = await _speech.initialize();
    if (!available) return false;
    await _speech.listen(
      onResult: (result) => onWords(result.recognizedWords),
      listenOptions: SpeechListenOptions(localeId: 'en_US'),
    );
    return true;
  }

  Future<void> stop() => _speech.stop();
}
