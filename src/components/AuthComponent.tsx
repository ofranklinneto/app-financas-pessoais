'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'

export default function AuthComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Flux
            </h1>
          </div>
          <p className="text-gray-600">
            Sua plataforma inteligente de finanças pessoais
          </p>
        </div>

        {/* Card de Login */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Entre na sua conta
            </CardTitle>
            <CardDescription>
              Acesse seu dashboard financeiro personalizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#2563eb',
                      brandAccent: '#1d4ed8',
                      brandButtonText: 'white',
                      defaultButtonBackground: '#f8fafc',
                      defaultButtonBackgroundHover: '#f1f5f9',
                      inputBackground: 'white',
                      inputBorder: '#e2e8f0',
                      inputBorderHover: '#cbd5e1',
                      inputBorderFocus: '#2563eb',
                    },
                    space: {
                      buttonPadding: '12px 16px',
                      inputPadding: '12px 16px',
                    },
                    borderWidths: {
                      buttonBorderWidth: '1px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '8px',
                      buttonBorderRadius: '8px',
                      inputBorderRadius: '8px',
                    },
                  },
                },
                className: {
                  container: 'space-y-4',
                  button: 'transition-all duration-200 hover:scale-[1.02]',
                  input: 'transition-all duration-200',
                },
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'E-mail',
                    password_label: 'Senha',
                    button_label: 'Entrar',
                    loading_button_label: 'Entrando...',
                    social_provider_text: 'Entrar com {{provider}}',
                    link_text: 'Já tem uma conta? Entre aqui',
                  },
                  sign_up: {
                    email_label: 'E-mail',
                    password_label: 'Senha',
                    button_label: 'Criar conta',
                    loading_button_label: 'Criando conta...',
                    social_provider_text: 'Criar conta com {{provider}}',
                    link_text: 'Não tem uma conta? Crie aqui',
                    confirmation_text: 'Verifique seu e-mail para confirmar a conta',
                  },
                  forgotten_password: {
                    email_label: 'E-mail',
                    button_label: 'Enviar instruções',
                    loading_button_label: 'Enviando...',
                    link_text: 'Esqueceu sua senha?',
                    confirmation_text: 'Verifique seu e-mail para redefinir a senha',
                  },
                },
              }}
              providers={[]}
              redirectTo={typeof window !== 'undefined' ? window.location.origin : ''}
            />
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <p>Controle Total</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <p>IA Integrada</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
              <p>Metas Inteligentes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}