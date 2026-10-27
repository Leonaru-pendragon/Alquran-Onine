import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TAJWID_BOOK_META,
  TAJWID_RULES,
  TAJWID_BOOK_QUESTIONS,
  TAJWID_QUIZ_QUESTIONS,
  renderTajwidHtml,
  analyzeTajwidOccurrences,
  getTajwidRuleById
} from '../../data/tajwidRules';

test('Qiraati Ilmu Tajwid Praktis curriculum covers all 13 Pelajaran, 36 kaidah, 33 book questions, and exact PDF rules', () => {
  assert.equal(TAJWID_BOOK_META.jumlahPelajaran, 13);
  assert.equal(TAJWID_RULES.length, 36, 'Should contain all 36 atomic kaidah from Pelajaran ke-1 to ke-13');

  // Verify every Pelajaran 1..13 is represented
  for (let p = 1; p <= 13; p++) {
    assert.ok(
      TAJWID_RULES.some((r) => r.pelajaranKe === p),
      `Pelajaran ke-${p} must be present in TAJWID_RULES`
    );
  }

  // Verify exact PDF classifications for Pelajaran 6 (Mutajanisain) & Pelajaran 7 (Mutaqarribain)
  const mutajanisain = getTajwidRuleById('idgham-mutajanisain');
  assert.ok(mutajanisain);
  assert.deepEqual(mutajanisain.huruf, ['ت-ط', 'ط-ت', 'ت-د', 'د-ت', 'ل-ر', 'ذ-ظ']);

  const mutaqarribain = getTajwidRuleById('idgham-mutaqaribain');
  assert.ok(mutaqarribain);
  assert.deepEqual(mutaqarribain.huruf, ['ث-ذ', 'ق-ك', 'ب-م']);

  // Verify exact PDF Alif measurements in Pelajaran 13
  assert.equal(getTajwidRuleById('mad-wajib-muttasil')?.kadarHarakat, '2½ Alif (5 harakat)');
  assert.equal(getTajwidRuleById('mad-jaiz-munfasil')?.kadarHarakat, '2½ Alif (5 harakat)');
  assert.equal(getTajwidRuleById('mad-aridh-lissukun')?.kadarHarakat, '3 (tiga) Alif (6 harakat)');
  assert.equal(getTajwidRuleById('mad-iwadh')?.kadarHarakat, '1 (satu) Alif (2 harakat)');
  assert.equal(getTajwidRuleById('mad-lin')?.kadarHarakat, '3 (tiga) Alif (6 harakat)');
  assert.equal(getTajwidRuleById('mad-lazim-mukhaffaf-harfi')?.kadarHarakat, '1 (satu) Alif (2 harakat)');
  assert.equal(getTajwidRuleById('mad-farq')?.kadarHarakat, '3 (tiga) Alif (6 harakat)');

  // Verify all 33 evaluation questions from pages 35-37 of the PDF exist in order 1..33
  assert.equal(TAJWID_BOOK_QUESTIONS.length, 33);
  assert.equal(TAJWID_BOOK_QUESTIONS[0].nomor, 1);
  assert.equal(TAJWID_BOOK_QUESTIONS[32].nomor, 33);
  for (const bq of TAJWID_BOOK_QUESTIONS) {
    if (bq.ruleId) {
      assert.ok(getTajwidRuleById(bq.ruleId), `Book question #${bq.nomor} ruleId ${bq.ruleId} must exist`);
    }
  }

  // Verify quiz options always contain the exact correct answer
  assert.equal(TAJWID_QUIZ_QUESTIONS.length, 14);
  for (const q of TAJWID_QUIZ_QUESTIONS) {
    assert.ok(q.options.includes(q.correct), `Correct answer must be in options for ${q.id}`);
  }
});

test('renderTajwidHtml produces non-nested semantic data-tajwid spans without leaking private-use placeholders', () => {
  const sample =
    'إِنَّآ أَنزَلْنَٰهُ فِى لَيْلَةِ ٱلْقَدْرِ · تَرْمِيهِم بِحِجَارَةٍ · وَلَا ٱلضَّآلِّينَ';
  const html = renderTajwidHtml(sample, true);

  assert.equal(html.includes('\uE000'), false);
  assert.equal(html.includes('\uE001'), false);

  const nestedSpanPattern = /<span[^>]*>[^<]*<span/i;
  assert.equal(nestedSpanPattern.test(html), false, 'Spans must never nest inside each other');

  assert.ok(html.includes('data-tajwid="mad-jaiz-munfasil"'));
  assert.ok(html.includes('data-tajwid="ikhfa"'));
  assert.ok(html.includes('data-tajwid="qalqalah"'));
  assert.ok(html.includes('data-tajwid="ikhfa-syafawi"'));
  assert.ok(html.includes('data-tajwid="mad-lazim"'));
});

test('renderTajwidHtml accurately detects Idzhar Wajib (4 words), Mutamatsilain exception (Hal. 35), Mutajanisain, Mutaqarribain, Mad Farq, and Lafadh Allah', () => {
  // Pelajaran 11: Idzhar Wajib (4 words) must never be misclassified as Idgham Bighunnah
  const idzharWajibHtml = renderTajwidHtml('الدُّنْيَا · بُنْيَانٌ · صِنْوَانٌ · قِنْوَانٌ', true);
  assert.ok(idzharWajibHtml.includes('data-tajwid="idzhar-wajib"'));
  assert.equal(idzharWajibHtml.includes('data-tajwid="idgham-bighunnah"'), false);

  // Hal. 35 exception: فِي يَوْمٍ and اِصْبِرُوا وَصَابِرُوا must NOT be classified as Idgham Mutamatsilain
  const hal35Html = renderTajwidHtml('فِي يَوْمٍ · اِصْبِرُوا وَصَابِرُوا', true);
  assert.equal(hal35Html.includes('data-tajwid="idgham-mutamatsilain"'), false);

  // Pelajaran 5, 6, 7: Mutamatsilain, Mutajanisain (قُلْ رَبِّ, قَدْ تَبَيَّنَ), Mutaqarribain (ارْكَبْ مَعَنَا, نَخْلُقْكُمْ)
  const tigaIdgham = renderTajwidHtml('اِضْرِبْ بِعَصَاكَ · قَدْ تَبَيَّنَ · قُلْ رَبِّ · أَلَمْ نَخْلُقْكُمْ · ارْكَبْ مَعَنَا', true);
  assert.ok(tigaIdgham.includes('data-tajwid="idgham-mutamatsilain"'));
  assert.ok(tigaIdgham.includes('data-tajwid="idgham-mutajanisain"'));
  assert.ok(tigaIdgham.includes('data-tajwid="idgham-mutaqaribain"'));

  // Pelajaran 9: Lafadh Allah Tarqiq (بِاللَّهِ · بِسْمِ اللَّهِ) vs Tafkhim (وَاللَّهُ · نَصْرُ اللَّهِ)
  const tarqiqHtml = renderTajwidHtml('بِاللَّهِ · بِسْمِ اللَّهِ', true);
  assert.ok(tarqiqHtml.includes('data-tajwid="lam-jalalah-tarqiq"'));
  assert.equal(tarqiqHtml.includes('data-tajwid="lam-jalalah-tafkhim"'), false);

  const tafkhimHtml = renderTajwidHtml('وَاللَّهُ · نَصْرُ اللَّهِ', true);
  assert.ok(tafkhimHtml.includes('data-tajwid="lam-jalalah-tafkhim"'));

  // Pelajaran 13 Ke-10 & Ke-13: Mad Lazim Mukhaffaf Kalimi (آلْآنَ) & Mad Farq (قُلْ آللَّهُ)
  const madKhusus = renderTajwidHtml('آلْآنَ · قُلْ آللَّهُ', true);
  assert.ok(madKhusus.includes('data-tajwid="mad-lazim-mukhaffaf-kalimi"'));
  assert.ok(madKhusus.includes('data-tajwid="mad-farq"'));

  // Saktah barrier prevents Idgham Bilaghunnah & Mutajanisain
  const saktah = renderTajwidHtml('وَقِيلَ مَنْ \u06DC رَاقٍ · كَلَّا بَلْ \u06DC رَانَ', true);
  assert.equal(saktah.includes('data-tajwid="idgham-bilaghunnah"'), false);
  assert.equal(saktah.includes('data-tajwid="idgham-mutajanisain"'), false);
});

test('analyzeTajwidOccurrences groups detected rules accurately and resolves via getTajwidRuleById', () => {
  const verse = 'ٱلَّذِىٓ أَطْعَمَهُم مِّن جُوعٍ وَءَامَنَهُم مِّنْ خَوْفٍ';
  const occurrences = analyzeTajwidOccurrences(verse);
  const ids = occurrences.map((o) => o.ruleId);

  assert.ok(ids.includes('mad-jaiz-munfasil'));
  assert.ok(ids.includes('qalqalah'));
  assert.ok(ids.includes('idgham-mimi'));
  assert.ok(ids.includes('ikhfa'));
  assert.ok(ids.includes('idgham-bighunnah'));
  assert.ok(ids.includes('izhar-halqi'));

  for (const occ of occurrences) {
    assert.ok(getTajwidRuleById(occ.ruleId), `Rule ${occ.ruleId} must resolve in getTajwidRuleById`);
  }
});

test('All 35 operational Qiraati Tajwid rules are active in Mushaf (only theoretical Pelajaran 2 comparison note is inactive)', () => {
  const active = TAJWID_RULES.filter((r) => r.aktifDiMushaf);
  const inactive = TAJWID_RULES.filter((r) => !r.aktifDiMushaf);
  assert.equal(active.length, 35);
  assert.deepEqual(
    inactive.map((r) => r.id),
    ['perbedaan-nun-sukun-tanwin']
  );
});

test('Accurate detection on real Kemenag RI (equran.id) Surah orthography, Waqf marks, and Huruf Muqaththaat', () => {
  // 1. Surah Al-Ikhlas (112:1-4 Kemenag RI): Qalqalah Kubra across trailing waqf marks & Idzhar Halqi before Kemenag initial Alif-Hamzah
  const ikhlas = [
    'قُلْ هُوَ اللّٰهُ اَحَدٌۚ',
    'اَللّٰهُ الصَّمَدُۚ',
    'لَمْ يَلِدْ وَلَمْ يُوْلَدْۙ',
    'وَلَمْ يَكُنْ لَّهٗ كُفُوًا اَحَدٌ ࣖ'
  ];
  const ikhlas1 = renderTajwidHtml(ikhlas[0], true);
  assert.ok(ikhlas1.includes('data-tajwid="lam-jalalah-tafkhim"'));
  assert.ok(ikhlas1.includes('data-tajwid="qalqalah-kubra"'), 'اَحَدٌۚ must trigger Qalqalah Kubra');

  const ikhlas2 = renderTajwidHtml(ikhlas[1], true);
  assert.ok(ikhlas2.includes('data-tajwid="al-syamsiyah"'));
  assert.ok(ikhlas2.includes('data-tajwid="qalqalah-kubra"'), 'الصَّمَدُۚ must trigger Qalqalah Kubra');

  const ikhlas3 = renderTajwidHtml(ikhlas[2], true);
  assert.ok(ikhlas3.includes('data-tajwid="izhar-syafawi"'));
  assert.ok(ikhlas3.includes('data-tajwid="qalqalah"'), 'يَلِدْ mid-verse must trigger Qalqalah Sughra');
  assert.ok(ikhlas3.includes('data-tajwid="qalqalah-kubra"'), 'يُوْلَدْۙ verse-end must trigger Qalqalah Kubra');

  const ikhlas4 = renderTajwidHtml(ikhlas[3], true);
  assert.ok(ikhlas4.includes('data-tajwid="idgham-bilaghunnah"'));
  assert.ok(ikhlas4.includes('data-tajwid="mad-shilah"'), 'لَّهٗ (\u0657) must trigger Mad Shilah');
  assert.ok(ikhlas4.includes('data-tajwid="izhar-halqi"'), 'كُفُوًا اَحَدٌ must trigger Idzhar Halqi on Kemenag initial Alif-Hamzah');
  assert.ok(ikhlas4.includes('data-tajwid="qalqalah-kubra"'), 'اَحَدٌ ࣖ must trigger Qalqalah Kubra');

  // 2. Surah Al-Qadr (97:1-5 Kemenag RI): Mad Jaiz Munfasil, Ikhfa, Qalqalah, Ra Tafkhim, Mad Wajib Muttasil, Inter-word waqf
  const qadr1 = renderTajwidHtml('اِنَّآ اَنْزَلْنٰهُ فِيْ لَيْلَةِ الْقَدْرِ', true);
  assert.ok(qadr1.includes('class="tajwid-ghunnah"'));
  assert.ok(qadr1.includes('data-tajwid="mad-jaiz-munfasil"'), 'اِنَّآ اَنْزَلْنٰهُ must trigger Mad Jaiz Munfasil');
  assert.equal(qadr1.includes('data-tajwid="mad-lazim-musyba-harfi"'), false, 'اِنَّآ must NOT be misclassified as Huruf Muqaththaat');
  assert.ok(qadr1.includes('data-tajwid="ikhfa"'));
  assert.ok(qadr1.includes('data-tajwid="al-qamariyah"'));
  assert.ok(qadr1.includes('data-tajwid="qalqalah"'));
  assert.ok(qadr1.includes('data-tajwid="ra-tafkhim"'), 'الْقَدْرِ on waqaf (preceded by sukun + fathah) is Ra Tafkhim');

  const qadr4 = renderTajwidHtml('تَنَزَّلُ الْمَلٰۤىِٕكَةُ وَالرُّوْحُ فِيْهَا بِاِذْنِ رَبِّهِمْۚ مِنْ كُلِّ اَمْرٍۛ', true);
  assert.ok(qadr4.includes('data-tajwid="mad-wajib-muttasil"'), 'الْمَلٰۤىِٕكَةُ Kemenag maddah+ya-hamzah must trigger Mad Wajib Muttasil');
  assert.ok(qadr4.includes('data-tajwid="idgham-mimi"'), 'رَبِّهِمْۚ مِنْ across waqf jaiz must trigger Idgham Mimi');
  assert.ok(qadr4.includes('data-tajwid="ikhfa"'));

  const qadr5 = renderTajwidHtml('سَلٰمٌ ۛهِيَ حَتّٰى مَطْلَعِ الْفَجْرِ ࣖ', true);
  assert.ok(qadr5.includes('data-tajwid="izhar-halqi"'), 'سَلٰمٌ ۛهِيَ across muanaqah waqf must trigger Idzhar Halqi');
  assert.ok(qadr5.includes('data-tajwid="qalqalah"'));
  assert.ok(qadr5.includes('data-tajwid="ra-tafkhim"'));

  // 3. Huruf Muqaththa'at: Mad Lazim Mukhaffaf Harfi (حيطهر = 1 Alif) vs Musyba' Harfi (نقص عسلكم = 3 Alif)
  const yasin1 = renderTajwidHtml('يٰسۤ ۚ', true);
  assert.ok(yasin1.includes('data-tajwid="mad-lazim-mukhaffaf-harfi"'), 'يٰ must be Mad Lazim Mukhaffaf Harfi');
  assert.ok(yasin1.includes('data-tajwid="mad-lazim-musyba-harfi"'), 'سۤ must be Mad Lazim Musyba Harfi');

  const maryam1 = renderTajwidHtml('كٓهٰيٰعٓصٓ ۚ', true);
  assert.ok(maryam1.includes('data-tajwid="mad-lazim-mukhaffaf-harfi"'));
  assert.ok(maryam1.includes('data-tajwid="mad-lazim-musyba-harfi"'));

  const thaha1 = renderTajwidHtml('طٰهٰ ۚ', true);
  assert.ok(thaha1.includes('data-tajwid="mad-lazim-mukhaffaf-harfi"'));
  assert.equal(thaha1.includes('data-tajwid="mad-lazim-musyba-harfi"'), false);

  // Ordinary maddah words must NEVER trigger Huruf Muqaththa'at
  const baqarah6 = renderTajwidHtml('سَوَاۤءٌ عَلَيْهِمْ ءَاَنْذَرْتَهُمْ اَمْ لَمْ تُنْذِرْهُمْ لَا يُؤْمِنُوْنَ', true);
  assert.equal(baqarah6.includes('data-tajwid="mad-lazim-musyba-harfi"'), false);
  assert.ok(baqarah6.includes('data-tajwid="mad-wajib-muttasil"'), 'سَوَاۤءٌ must trigger Mad Wajib Muttasil');
  assert.ok(baqarah6.includes('data-tajwid="izhar-halqi"'));
  assert.ok(baqarah6.includes('data-tajwid="mad-aridh-lissukun"'), 'يُؤْمِنُوْنَ at ayah end must trigger Mad Aridh Lissukun');

  // 4. Surah Quraisy (106:1-4 Kemenag RI): Mad Badal (\u0656), Mad Lin on Waqaf, Mad Shilah Thawilah (\u0657\u0653)
  const quraisy1 = renderTajwidHtml('لِاِيْلٰفِ قُرَيْشٍۙ', true);
  assert.ok(quraisy1.includes('data-tajwid="mad-badal"'), 'لِاِيْلٰفِ must trigger Mad Badal');
  assert.ok(quraisy1.includes('data-tajwid="mad-lin"'), 'قُرَيْشٍۙ at ayah end must trigger Mad Lin');

  const quraisy2 = renderTajwidHtml('اٖلٰفِهِمْ رِحْلَةَ الشِّتَاۤءِ وَالصَّيْفِۚ', true);
  assert.ok(quraisy2.includes('data-tajwid="mad-badal"'), 'اٖلٰفِهِمْ (\u0656) must trigger Mad Badal');
  assert.ok(quraisy2.includes('data-tajwid="mad-wajib-muttasil"'));
  assert.ok(quraisy2.includes('data-tajwid="mad-lin"'), 'وَالصَّيْفِۚ at ayah end must trigger Mad Lin');

  const humazah3 = renderTajwidHtml('يَحْسَبُ اَنَّ مَالَهٗٓ اَخْلَدَهٗۚ', true);
  assert.ok(humazah3.includes('data-tajwid="mad-shilah"'), 'مَالَهٗٓ اَخْلَدَهٗ must trigger Mad Shilah');

  // 5. Mad 'Iwadh vs Qalqalah Kubra vs Ta' Marbuthah Fathatain
  const naba6 = renderTajwidHtml('اَلَمْ نَجْعَلِ الْاَرْضَ مِهٰدًاۙ', true);
  assert.ok(naba6.includes('data-tajwid="mad-iwadh"'), 'مِهٰدًاۙ must trigger Mad Iwadh');
  assert.equal(
    naba6.includes('data-tajwid="qalqalah-kubra"'),
    false,
    'مِهٰدًاۙ is read مِهَادَا on waqaf, NOT Qalqalah Kubra'
  );

  const taMarbuthahEnd = renderTajwidHtml('رَبَّنَا اٰتِنَا مِنْ لَّدُنْكَ رَحْمَةً', true);
  assert.equal(taMarbuthahEnd.includes('data-tajwid="mad-iwadh"'), false, 'Ta marbuthah fathatain becomes Ha sukun on waqaf, NOT Mad Iwadh');

  // 6. Hadzful Mad li-Iltiqa'is Sakinain (dropped long vowel before Al-Ta'rif / Hamzah Wasl) & Ra Isti'la'
  const fatihah6 = renderTajwidHtml('اِهْدِنَا الصِّرَاطَ الْمُسْتَقِيْمَۙ', true);
  assert.equal(
    fatihah6.includes('<span class="tajwid-mad-thabii" data-tajwid="mad-thabii">نَا</span>'),
    false,
    'نَا before الصِّرَاطَ drops Mad Thabii due to Iltiqaus Sakinain'
  );
  assert.ok(fatihah6.includes('data-tajwid="al-syamsiyah"'));
  assert.ok(fatihah6.includes('data-tajwid="al-qamariyah"'));
  assert.ok(fatihah6.includes('data-tajwid="mad-aridh-lissukun"'));

  const falaq4 = renderTajwidHtml('وَمِنْ شَرِّ النَّفّٰثٰتِ فِى الْعُقَدِۙ', true);
  assert.equal(
    falaq4.includes('<span class="tajwid-mad-thabii" data-tajwid="mad-thabii">فِى</span>'),
    false,
    'فِى before الْعُقَدِ drops Mad Thabii due to Iltiqaus Sakinain'
  );
  assert.ok(falaq4.includes('class="tajwid-ghunnah"'), 'النَّفّٰثٰتِ must preserve Ghunnah on نَّ alongside Al-Syamsiyah');
  assert.ok(falaq4.includes('data-tajwid="qalqalah-kubra"'));

  const naba21 = renderTajwidHtml('اِنَّ جَهَنَّمَ كَانَتْ مِرْصَادًاۙ', true);
  assert.ok(naba21.includes('data-tajwid="ra-tafkhim"'), 'مِرْصَادًا (Ra sukun after kasrah before Istila ص) must be Ra Tafkhim');
  assert.equal(naba21.includes('data-tajwid="ra-tarqiq"'), false);

  const firaun = renderTajwidHtml('اِذْهَبْ اِلٰى فِرْعَوْنَ اِنَّهٗ طَغٰى', true);
  assert.ok(firaun.includes('data-tajwid="ra-tarqiq"'), 'فِرْعَوْنَ (Ra sukun after kasrah before non-Istila ع) must be Ra Tarqiq');
});

test('Arabic cursive shaping invariant: spans never start with orphaned combining diacritics or nest', () => {
  const sampleVerses = [
    'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ',
    'صِرَاطَ الَّذِيْنَ اَنْعَمْتَ عَلَيْهِمْ ەۙ غَيْرِ الْمَغْضُوْبِ عَلَيْهِمْ وَلَا الضَّاۤلِّيْنَ ࣖ',
    'ذٰلِكَ الْكِتٰبُ لَا رَيْبَ ۛ فِيْهِ ۛ هُدًى لِّلْمُتَّقِيْنَۙ',
    'وَمِنْ شَرِّ غَاسِقٍ اِذَا وَقَبَۙ',
    'مِنْ شَرِّ الْوَسْوَاسِ ەۙ الْخَنَّاسِۖ',
    'تَنَزَّلُ الْمَلٰۤىِٕكَةُ وَالرُّوْحُ فِيْهَا بِاِذْنِ رَبِّهِمْۚ مِنْ كُلِّ اَمْرٍۛ'
  ];

  const orphanedMarkAfterTag = /<\/?span[^>]*>[\u0610-\u061A\u064B-\u065F\u0670\u08F0-\u08F2]/;
  const nestedSpan = /<span[^>]*>[^<]*<span/i;

  for (const v of sampleVerses) {
    const html = renderTajwidHtml(v, true);
    assert.equal(nestedSpan.test(html), false, `Must not nest spans in: ${v}`);
    assert.equal(
      orphanedMarkAfterTag.test(html),
      false,
      `Must not split base letter from its combining harakat/shaddah/tanwin across span boundary in: ${html}`
    );
  }
});
