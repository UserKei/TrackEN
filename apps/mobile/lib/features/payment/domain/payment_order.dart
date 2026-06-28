class PaymentOrder {
  const PaymentOrder({
    required this.channel,
    required this.outTradeNo,
    required this.timeExpire,
    this.payUrl,
    this.orderInfo,
  });

  final String channel;
  final String outTradeNo;
  final int timeExpire;
  final String? payUrl;
  final String? orderInfo;

  factory PaymentOrder.fromJson(Object? json) {
    final map = json as Map<String, dynamic>? ?? const {};
    return PaymentOrder(
      channel: map['channel'] as String? ?? 'web',
      outTradeNo: map['outTradeNo'] as String? ?? '',
      timeExpire: (map['timeExpire'] as num?)?.toInt() ?? 0,
      payUrl: map['payUrl'] as String?,
      orderInfo: map['orderInfo'] as String?,
    );
  }
}

class NativePaymentResult {
  const NativePaymentResult({
    required this.status,
    required this.memo,
    required this.raw,
  });

  final String status;
  final String memo;
  final Map<dynamic, dynamic> raw;

  bool get isSubmitted => status == '9000' || status == '8000';

  factory NativePaymentResult.fromMap(Map<dynamic, dynamic> map) {
    return NativePaymentResult(
      status: '${map['resultStatus'] ?? ''}',
      memo: '${map['memo'] ?? ''}',
      raw: map,
    );
  }
}
