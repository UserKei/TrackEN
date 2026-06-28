import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AppAsyncView<T> extends StatelessWidget {
  const AppAsyncView({
    required this.value,
    required this.builder,
    this.emptyBuilder,
    super.key,
  });

  final AsyncValue<T> value;
  final Widget Function(T data) builder;
  final WidgetBuilder? emptyBuilder;

  @override
  Widget build(BuildContext context) {
    return value.when(
      data: (data) => builder(data),
      error: (error, stackTrace) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            error.toString(),
            textAlign: TextAlign.center,
            style: TextStyle(color: Theme.of(context).colorScheme.error),
          ),
        ),
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
    );
  }
}
