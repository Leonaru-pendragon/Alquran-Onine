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
