import 'package:flutter/material.dart';

class LearnScreen extends StatelessWidget {
  const LearnScreen({required this.courseId, required this.title, super.key});

  final String courseId;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(child: Text('课程 $courseId 的学习模块建设中')),
    );
  }
}
