import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:tobias/tobias.dart';

import '../../../core/config/app_env.dart';
import '../domain/payment_order.dart';

final nativePaymentServiceProvider = Provider<NativePaymentService>((ref) {
  return NativePaymentService(Tobias());
});

class NativePaymentService {
  const NativePaymentService(this._tobias);

  final Tobias _tobias;

  Future<NativePaymentResult> pay(String orderInfo) async {
    if (AppEnv.alipayAppId.isNotEmpty) {
      await _tobias.registerApp(
        AppEnv.alipayAppId,
        universalLink: AppEnv.alipayUniversalLink.isEmpty
            ? null
            : AppEnv.alipayUniversalLink,
      );
    }

    final result = await _tobias.pay(
      orderInfo,
      evn: AppEnv.alipaySandbox ? AliPayEvn.sandbox : AliPayEvn.online,
      universalLink: AppEnv.alipayUniversalLink.isEmpty
          ? null
          : AppEnv.alipayUniversalLink,
    );
    return NativePaymentResult.fromMap(result);
  }
}
