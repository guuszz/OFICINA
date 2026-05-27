import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from '@react-pdf/renderer';

// Usa Helvetica default (built-in @react-pdf/renderer). PDF não precisa ser
// pixel-perfect com Plus Jakarta — Helvetica é universalmente disponível e
// não depende de download de TTF externa (que pode dar 404).

// ─── Tipos ───────────────────────────────────────────────────────────
interface Ordem {
  id: string;
  descricao: string;
  valor: number;
  status: string;
  createdAt: string;
  veiculo: {
    placa: string;
    marca: string;
    modelo: string;
  };
  cliente: {
    nome: string;
    telefone?: string;
    email?: string;
  };
}

interface OficinaInfo {
  nome?: string;
  email?: string;
  telefone?: string;
}

// ─── Estilos PDF ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#334155',
    marginBottom: 24,
  },
  brand: {
    flexDirection: 'column',
  },
  brandName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#334155',
  },
  brandTagline: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  docTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0F172A',
    marginBottom: 2,
  },
  docMeta: {
    fontSize: 9,
    color: '#64748B',
  },

  // Sections
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 24,
  },
  col: {
    flex: 1,
  },

  // Info blocks
  infoBlock: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
    padding: 12,
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 8,
    color: '#64748B',
    width: 60,
  },
  infoValue: {
    fontSize: 10,
    color: '#0F172A',
    fontWeight: 500,
    flex: 1,
  },

  // Veículo highlight
  placaBox: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },

  // Descrição
  descBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E8EA',
    padding: 16,
    borderRadius: 4,
    minHeight: 80,
  },
  descText: {
    fontSize: 11,
    color: '#0F172A',
    lineHeight: 1.5,
  },

  // Total
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#059669',
    color: '#FFFFFF',
    padding: 16,
    borderRadius: 4,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#FFFFFF',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#FFFFFF',
  },

  // Status badge
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    alignSelf: 'flex-start',
  },
  statusAberta: { backgroundColor: '#FEF3C7', color: '#92400E' },
  statusAndamento: { backgroundColor: '#D1FAE5', color: '#065F46' },
  statusConcluida: { backgroundColor: '#DBEAFE', color: '#1E3A8A' },
  statusCancelada: { backgroundColor: '#E5E7EB', color: '#374151' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#E6E8EA',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#94A3B8',
  },
  footerStrong: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: 600,
  },

  // Signature
  signatureBlock: {
    marginTop: 40,
    flexDirection: 'row',
    gap: 48,
  },
  signatureCol: {
    flex: 1,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#0F172A',
    marginTop: 32,
    paddingTop: 4,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────
const formatMoney = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (s: string) =>
  new Date(s).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatId = (id: string) => `#${id.slice(-8).toUpperCase()}`;

const statusStyle = (status: string) => {
  if (status === 'Em Andamento') return styles.statusAndamento;
  if (status === 'Concluída' || status === 'Concluida') return styles.statusConcluida;
  if (status === 'Cancelada') return styles.statusCancelada;
  return styles.statusAberta;
};

// ─── Documento PDF ───────────────────────────────────────────────────
const OrdemPdfDocument: React.FC<{ ordem: Ordem; oficina?: OficinaInfo }> = ({
  ordem,
  oficina,
}) => (
  <Document
    title={`OS ${formatId(ordem.id)} — ${ordem.cliente.nome}`}
    author={oficina?.nome || 'OFICINA'}
    subject={`Ordem de Serviço ${formatId(ordem.id)}`}
  >
    <Page size="A4" style={styles.page}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <View style={styles.brand}>
          <Text style={styles.brandName}>{oficina?.nome || 'OFICINA'}</Text>
          <Text style={styles.brandTagline}>Gestão de oficina mecânica</Text>
          {oficina?.email && (
            <Text style={[styles.brandTagline, { marginTop: 6 }]}>{oficina.email}</Text>
          )}
          {oficina?.telefone && (
            <Text style={styles.brandTagline}>{oficina.telefone}</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.docTitle}>Ordem de Serviço</Text>
          <Text style={styles.docMeta}>{formatId(ordem.id)}</Text>
          <Text style={[styles.docMeta, { marginTop: 4 }]}>
            Emitida em {formatDate(ordem.createdAt)}
          </Text>
          <View style={[styles.statusBadge, statusStyle(ordem.status), { marginTop: 6 }]}>
            <Text>{ordem.status}</Text>
          </View>
        </View>
      </View>

      {/* ─── Cliente + Veículo lado a lado ─── */}
      <View style={[styles.section, styles.twoCol]}>
        <View style={styles.col}>
          <Text style={styles.sectionLabel}>Cliente</Text>
          <View style={styles.infoBlock}>
            <Text style={[styles.infoValue, { fontSize: 12, marginBottom: 6 }]}>
              {ordem.cliente.nome}
            </Text>
            {ordem.cliente.telefone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Telefone:</Text>
                <Text style={styles.infoValue}>{ordem.cliente.telefone}</Text>
              </View>
            )}
            {ordem.cliente.email && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{ordem.cliente.email}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.col}>
          <Text style={styles.sectionLabel}>Veículo</Text>
          <View style={styles.infoBlock}>
            <Text style={styles.placaBox}>{ordem.veiculo.placa}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Marca:</Text>
              <Text style={styles.infoValue}>{ordem.veiculo.marca}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Modelo:</Text>
              <Text style={styles.infoValue}>{ordem.veiculo.modelo}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ─── Descrição do serviço ─── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Descrição do serviço</Text>
        <View style={styles.descBox}>
          <Text style={styles.descText}>{ordem.descricao}</Text>
        </View>
      </View>

      {/* ─── Total ─── */}
      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Total a pagar</Text>
        <Text style={styles.totalValue}>{formatMoney(ordem.valor)}</Text>
      </View>

      {/* ─── Assinaturas ─── */}
      <View style={styles.signatureBlock}>
        <View style={styles.signatureCol}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Assinatura do cliente</Text>
        </View>
        <View style={styles.signatureCol}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Assinatura responsável</Text>
        </View>
      </View>

      {/* ─── Footer ─── */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>
          Documento gerado em {new Date().toLocaleString('pt-BR')}
        </Text>
        <Text style={styles.footerStrong}>{oficina?.nome || 'OFICINA'}</Text>
      </View>
    </Page>
  </Document>
);

// ─── Componente de download ──────────────────────────────────────────
interface OrdemPdfDownloadProps {
  ordem: Ordem;
  oficina?: OficinaInfo;
  children: (props: { loading: boolean; error: Error | null }) => React.ReactNode;
}

export const OrdemPdfDownload: React.FC<OrdemPdfDownloadProps> = ({
  ordem,
  oficina,
  children,
}) => {
  const filename = `OS-${formatId(ordem.id).replace('#', '')}-${ordem.cliente.nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()}.pdf`;

  return (
    <PDFDownloadLink
      document={<OrdemPdfDocument ordem={ordem} oficina={oficina} />}
      fileName={filename}
      style={{ textDecoration: 'none' }}
    >
      {({ loading, error }) => <>{children({ loading, error })}</>}
    </PDFDownloadLink>
  );
};

export default OrdemPdfDocument;
