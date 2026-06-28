import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/payment/domain/payment_order.dart';

void main() {
  test('parses native app payment order', () {
    final order = PaymentOrder.fromJson({
      'channel': 'app',
      'orderInfo': 'signed-order',
      'outTradeNo': 'XM-abc',
      'timeExpire': 123,
    });

    expect(order.channel, 'app');
    expect(order.orderInfo, 'signed-order');
    expect(order.outTradeNo, 'XM-abc');
    expect(order.timeExpire, 123);
  });

  test('treats Alipay submitted statuses as submitted', () {
    expect(
      NativePaymentResult.fromMap({'resultStatus': '9000'}).isSubmitted,
      isTrue,
    );
    expect(
      NativePaymentResult.fromMap({'resultStatus': '8000'}).isSubmitted,
      isTrue,
    );
    expect(
      NativePaymentResult.fromMap({'resultStatus': '6001'}).isSubmitted,
      isFalse,
    );
  });
}
