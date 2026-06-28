import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/app/app.dart';

void main() {
  testWidgets('renders TrackEN app shell', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: TrackEnApp()));

    expect(find.text('TrackEN'), findsOneWidget);
    expect(find.text('首页'), findsOneWidget);
    expect(find.text('课程'), findsOneWidget);
    expect(find.text('聊天'), findsOneWidget);
    expect(find.text('我的'), findsOneWidget);
  });
}
