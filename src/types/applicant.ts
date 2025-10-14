export type HasilAkhir = 'Lolos' | 'Tidak Lolos' | 'Proses' | 'Blm Proses';

export interface Applicant {
  id: string;
  nama: string;
  tahun: number;
  bulan: number;
  sumberLamaran: string;
  hasilAkhir: HasilAkhir;
  keterangan: string; // "PKWT" jika lolos, atau alasan jika tidak lolos
  tanggalInput: Date;
  tanggalUpdate: Date;
}

export interface ApplicantFilter {
  search?: string;
  hasilAkhir?: HasilAkhir;
  tahun?: number;
  bulan?: number;
  sumberLamaran?: string;
}

export interface ApplicantStats {
  total: number;
  lolos: number;
  tidakLolos: number;
  proses: number;
  blmProses: number;
}
