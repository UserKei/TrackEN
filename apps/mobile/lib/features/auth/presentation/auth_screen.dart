import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../application/auth_controller.dart';

enum AuthMode { login, register }

class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key});

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  AuthMode _mode = AuthMode.login;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(authControllerProvider, (previous, next) {
      if (previous?.isAuthenticated == true || !next.isAuthenticated) return;
      final from = GoRouterState.of(context).uri.queryParameters['from'];
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) context.go(from ?? '/profile');
      });
    });

    final authState = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('登录 TrackEN')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            SegmentedButton<AuthMode>(
              segments: const [
                ButtonSegment(
                  value: AuthMode.login,
                  icon: Icon(Icons.login),
                  label: Text('登录'),
                ),
                ButtonSegment(
                  value: AuthMode.register,
                  icon: Icon(Icons.person_add),
                  label: Text('注册'),
                ),
              ],
              selected: {_mode},
              onSelectionChanged: authState.isLoading
                  ? null
                  : (selection) => setState(() => _mode = selection.first),
            ),
            const SizedBox(height: 20),
            if (_mode == AuthMode.register) ...[
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: '姓名',
                  prefixIcon: Icon(Icons.badge_outlined),
                ),
                textInputAction: TextInputAction.next,
                validator: _requiredValidator,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: '邮箱',
                  prefixIcon: Icon(Icons.mail_outline),
                ),
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                validator: _emailValidator,
              ),
              const SizedBox(height: 12),
            ],
            TextFormField(
              controller: _phoneController,
              decoration: const InputDecoration(
                labelText: '手机号',
                prefixIcon: Icon(Icons.phone_outlined),
              ),
              keyboardType: TextInputType.phone,
              textInputAction: TextInputAction.next,
              validator: _requiredValidator,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _passwordController,
              decoration: const InputDecoration(
                labelText: '密码',
                prefixIcon: Icon(Icons.lock_outline),
              ),
              obscureText: true,
              textInputAction: TextInputAction.done,
              validator: _requiredValidator,
              onFieldSubmitted: (_) => _submit(),
            ),
            if (authState.error != null) ...[
              const SizedBox(height: 16),
              Card(
                color: Theme.of(context).colorScheme.errorContainer,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text(
                    authState.error!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onErrorContainer,
                    ),
                  ),
                ),
              ),
            ],
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: authState.isLoading ? null : _submit,
              icon: authState.isLoading
                  ? const SizedBox.square(
                      dimension: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Icon(
                      _mode == AuthMode.login ? Icons.login : Icons.person_add,
                    ),
              label: Text(_mode == AuthMode.login ? '登录' : '创建账号'),
            ),
          ],
        ),
      ),
    );
  }

  String? _requiredValidator(String? value) {
    if (value == null || value.trim().isEmpty) return '请填写此项';
    return null;
  }

  String? _emailValidator(String? value) {
    final required = _requiredValidator(value);
    if (required != null) return required;
    if (!value!.contains('@')) return '请填写有效邮箱';
    return null;
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final controller = ref.read(authControllerProvider.notifier);
    if (_mode == AuthMode.login) {
      await controller.login(
        phone: _phoneController.text.trim(),
        password: _passwordController.text,
      );
      return;
    }

    await controller.register(
      name: _nameController.text.trim(),
      phone: _phoneController.text.trim(),
      email: _emailController.text.trim(),
      password: _passwordController.text,
    );
  }
}
