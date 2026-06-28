class TokenPair {
  const TokenPair({required this.accessToken, required this.refreshToken});

  final String accessToken;
  final String refreshToken;

  factory TokenPair.fromJson(Object? json) {
    final map = json as Map<String, dynamic>? ?? const {};
    return TokenPair(
      accessToken: map['accessToken'] as String? ?? '',
      refreshToken: map['refreshToken'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'accessToken': accessToken,
    'refreshToken': refreshToken,
  };

  bool get isValid => accessToken.isNotEmpty && refreshToken.isNotEmpty;
}
