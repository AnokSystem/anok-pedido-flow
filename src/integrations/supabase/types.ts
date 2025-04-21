export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clientes: {
        Row: {
          bairro: string | null
          cidade: string | null
          contato: string | null
          cpf_cnpj: string | null
          criado_em: string
          desconto_especial: number | null
          email: string | null
          empresa_id: string | null
          id: string
          nome: string
          numero: string | null
          responsavel: string | null
          rua: string | null
        }
        Insert: {
          bairro?: string | null
          cidade?: string | null
          contato?: string | null
          cpf_cnpj?: string | null
          criado_em?: string
          desconto_especial?: number | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nome: string
          numero?: string | null
          responsavel?: string | null
          rua?: string | null
        }
        Update: {
          bairro?: string | null
          cidade?: string | null
          contato?: string | null
          cpf_cnpj?: string | null
          criado_em?: string
          desconto_especial?: number | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string
          numero?: string | null
          responsavel?: string | null
          rua?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string | null
          contato: string | null
          criada_em: string
          email: string | null
          endereco: string | null
          id: string
          logo: string | null
          nome_empresa: string
          pix: string | null
        }
        Insert: {
          cnpj?: string | null
          contato?: string | null
          criada_em?: string
          email?: string | null
          endereco?: string | null
          id?: string
          logo?: string | null
          nome_empresa: string
          pix?: string | null
        }
        Update: {
          cnpj?: string | null
          contato?: string | null
          criada_em?: string
          email?: string | null
          endereco?: string | null
          id?: string
          logo?: string | null
          nome_empresa?: string
          pix?: string | null
        }
        Relationships: []
      }
      itens_pedido: {
        Row: {
          altura: number | null
          criado_em: string
          descricao: string | null
          id: string
          largura: number | null
          pedido_id: string | null
          produto_id: string | null
          quantidade: number
          unidade: string
          valor_total: number
          valor_unit: number
        }
        Insert: {
          altura?: number | null
          criado_em?: string
          descricao?: string | null
          id?: string
          largura?: number | null
          pedido_id?: string | null
          produto_id?: string | null
          quantidade: number
          unidade: string
          valor_total: number
          valor_unit: number
        }
        Update: {
          altura?: number | null
          criado_em?: string
          descricao?: string | null
          id?: string
          largura?: number | null
          pedido_id?: string | null
          produto_id?: string | null
          quantidade?: number
          unidade?: string
          valor_total?: number
          valor_unit?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          data: string
          descricao: string
          entidade: string
          id: string
          tipo: string
          usuario_id: string | null
        }
        Insert: {
          data?: string
          descricao: string
          entidade: string
          id?: string
          tipo: string
          usuario_id?: string | null
        }
        Update: {
          data?: string
          descricao?: string
          entidade?: string
          id?: string
          tipo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          cliente_id: string | null
          criado_em: string
          criado_por: string | null
          data_emissao: string
          data_entrega: string | null
          empresa_id: string | null
          id: string
          numero_pedido: string
          status: string
          total: number
        }
        Insert: {
          cliente_id?: string | null
          criado_em?: string
          criado_por?: string | null
          data_emissao?: string
          data_entrega?: string | null
          empresa_id?: string | null
          id?: string
          numero_pedido: string
          status?: string
          total?: number
        }
        Update: {
          cliente_id?: string | null
          criado_em?: string
          criado_por?: string | null
          data_emissao?: string
          data_entrega?: string | null
          empresa_id?: string | null
          id?: string
          numero_pedido?: string
          status?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          criado_em: string
          descricao: string | null
          empresa_id: string | null
          id: string
          nome: string
          preco_unitario: number
          unidade: string
        }
        Insert: {
          criado_em?: string
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          nome: string
          preco_unitario: number
          unidade: string
        }
        Update: {
          criado_em?: string
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string
          preco_unitario?: number
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          avatar: string | null
          criado_em: string
          email: string
          empresa_id: string | null
          id: string
          nome: string
          permissoes: string[] | null
          tipo_usuario: string
        }
        Insert: {
          avatar?: string | null
          criado_em?: string
          email: string
          empresa_id?: string | null
          id?: string
          nome: string
          permissoes?: string[] | null
          tipo_usuario?: string
        }
        Update: {
          avatar?: string | null
          criado_em?: string
          email?: string
          empresa_id?: string | null
          id?: string
          nome?: string
          permissoes?: string[] | null
          tipo_usuario?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          ativado: boolean | null
          campos_selecionados: string[] | null
          criado_em: string
          empresa_id: string | null
          id: string
          url_destino: string
        }
        Insert: {
          ativado?: boolean | null
          campos_selecionados?: string[] | null
          criado_em?: string
          empresa_id?: string | null
          id?: string
          url_destino: string
        }
        Update: {
          ativado?: boolean | null
          campos_selecionados?: string[] | null
          criado_em?: string
          empresa_id?: string | null
          id?: string
          url_destino?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
