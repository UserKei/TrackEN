import 'package:flutter/material.dart';

class AppSection extends StatelessWidget {
  const AppSection({
    required this.title,
    required this.child,
    this.trailing,
    super.key,
  });

  final String title;
  final Widget child;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(child: Text(title, style: textTheme.titleMedium)),
            ?trailing,
          ],
        ),
        const SizedBox(height: 12),
        child,
      ],
    );
  }
}
