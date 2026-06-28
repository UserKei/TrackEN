import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'router.dart';
import 'theme.dart';

class TrackEnApp extends ConsumerWidget {
  const TrackEnApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'TrackEN',
      debugShowCheckedModeBanner: false,
      theme: buildTrackEnTheme(Brightness.light),
      darkTheme: buildTrackEnTheme(Brightness.dark),
      routerConfig: router,
    );
  }
}
