import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import '../../../core/network/api_client.dart';

final paymentSocketClientProvider = Provider<PaymentSocketClient>((ref) {
  final client = PaymentSocketClient();
  ref.onDispose(client.dispose);
  return client;
});

class PaymentSocketClient {
  io.Socket? _socket;
  String? _userId;
  final _paymentSuccessController = StreamController<void>.broadcast();

  Stream<void> get paymentSuccess => _paymentSuccessController.stream;

  void connect(String userId) {
    if (_socket?.connected == true && _userId == userId) return;
    disposeSocket();
    _userId = userId;
    _socket = io.io(
      ApiClient.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setQuery({'userId': userId})
          .disableAutoConnect()
          .build(),
    );
    _socket!
      ..on('paymentSuccess', (_) {
        if (!_paymentSuccessController.isClosed) {
          _paymentSuccessController.add(null);
        }
      })
      ..connect();
  }

  void disposeSocket() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _userId = null;
  }

  void dispose() {
    disposeSocket();
    _paymentSuccessController.close();
  }
}
