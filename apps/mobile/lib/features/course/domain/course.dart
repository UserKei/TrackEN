class Course {
  const Course({
    required this.id,
    required this.name,
    required this.value,
    required this.description,
    required this.teacher,
    required this.url,
    required this.price,
  });

  final String id;
  final String name;
  final String value;
  final String description;
  final String teacher;
  final String url;
  final String price;

  factory Course.fromJson(Object? json) {
    final map = json as Map<String, dynamic>? ?? const {};
    return Course(
      id: map['id'] as String? ?? '',
      name: map['name'] as String? ?? '',
      value: map['value'] as String? ?? '',
      description: map['description'] as String? ?? '',
      teacher: map['teacher'] as String? ?? '',
      url: map['url'] as String? ?? '',
      price: '${map['price'] ?? ''}',
    );
  }
}
