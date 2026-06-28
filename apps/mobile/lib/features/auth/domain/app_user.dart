import 'token_pair.dart';

class AppUser {
  const AppUser({
    required this.id,
    required this.name,
    required this.phone,
    required this.isTimingTask,
    required this.timingTaskTime,
    required this.wordNumber,
    required this.dayNumber,
    this.email,
    this.address,
    this.avatar,
    this.bio,
    this.createdAt,
    this.updatedAt,
    this.lastLoginAt,
  });

  final String id;
  final String name;
  final String phone;
  final String? email;
  final String? address;
  final String? avatar;
  final String? bio;
  final bool isTimingTask;
  final String timingTaskTime;
  final int wordNumber;
  final int dayNumber;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final DateTime? lastLoginAt;

  factory AppUser.fromJson(Object? json) {
    final map = json as Map<String, dynamic>? ?? const {};
    return AppUser(
      id: map['id'] as String? ?? '',
      name: map['name'] as String? ?? '',
      phone: map['phone'] as String? ?? '',
      email: map['email'] as String?,
      address: map['address'] as String?,
      avatar: map['avatar'] as String?,
      bio: map['bio'] as String?,
      isTimingTask: map['isTimingTask'] as bool? ?? false,
      timingTaskTime: map['timingTaskTime'] as String? ?? '',
      wordNumber: (map['wordNumber'] as num?)?.toInt() ?? 0,
      dayNumber: (map['dayNumber'] as num?)?.toInt() ?? 0,
      createdAt: DateTime.tryParse(map['createdAt'] as String? ?? ''),
      updatedAt: DateTime.tryParse(map['updatedAt'] as String? ?? ''),
      lastLoginAt: DateTime.tryParse(map['lastLoginAt'] as String? ?? ''),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'phone': phone,
    'email': email,
    'address': address,
    'avatar': avatar,
    'bio': bio,
    'isTimingTask': isTimingTask,
    'timingTaskTime': timingTaskTime,
    'wordNumber': wordNumber,
    'dayNumber': dayNumber,
    'createdAt': createdAt?.toIso8601String(),
    'updatedAt': updatedAt?.toIso8601String(),
    'lastLoginAt': lastLoginAt?.toIso8601String(),
  };

  AppUser copyWith({
    String? name,
    String? email,
    String? address,
    String? avatar,
    String? bio,
    bool? isTimingTask,
    String? timingTaskTime,
  }) {
    return AppUser(
      id: id,
      name: name ?? this.name,
      phone: phone,
      email: email ?? this.email,
      address: address ?? this.address,
      avatar: avatar ?? this.avatar,
      bio: bio ?? this.bio,
      isTimingTask: isTimingTask ?? this.isTimingTask,
      timingTaskTime: timingTaskTime ?? this.timingTaskTime,
      wordNumber: wordNumber,
      dayNumber: dayNumber,
      createdAt: createdAt,
      updatedAt: updatedAt,
      lastLoginAt: lastLoginAt,
    );
  }
}

class UserSession {
  const UserSession({required this.user, required this.token});

  final AppUser user;
  final TokenPair token;

  factory UserSession.fromJson(Object? json) {
    final map = json as Map<String, dynamic>? ?? const {};
    return UserSession(
      user: AppUser.fromJson(map),
      token: TokenPair.fromJson(map['token']),
    );
  }

  Map<String, dynamic> toJson() => {...user.toJson(), 'token': token.toJson()};
}
