/**
 * Prescripto Patient Blog Data
 * Editorial health articles written for patient education and awareness.
 */

export const BLOG_DISCLAIMER =
  'This article is for general information only and is not a substitute for professional medical advice, diagnosis or treatment. If you are worried about your health, talk to a qualified doctor.'

export const blogsData = [
  {
    slug: 'typhoid-fever-symptoms-causes-and-treatment',
    title: 'Typhoid Fever: Symptoms, Causes and Treatment',
    excerpt:
      'Learn about the early warning signs of typhoid, how it spreads, and treatment options.',
    image: 'https://i.ibb.co.com/4wz5Pr8X/coughing-person-23-2148497373.avif',
    imagePosition: 'center 30%',
    category: 'General physician',
    publishedAt: '2026-11-20T09:00:00Z',
    author: 'Prescripto Editorial Team',
    takeaways: [
      'Typhoid fever is a serious bacterial infection primarily transmitted through contaminated food and drinking water.',
      'Symptoms develop gradually over several days, beginning with step-ladder fever, intense headache, fatigue, and stomach distress.',
      'Prompt medical diagnosis and completing the entire course of doctor-prescribed antibiotics are essential to prevent relapse.',
    ],
    content: [
      {
        type: 'p',
        text: 'Typhoid fever remains a widespread bacterial infection in many parts of the world, particularly in regions where clean water access and food sanitation pose ongoing challenges. Understanding how this illness behaves in its earliest stages empowers individuals and families to seek timely medical attention before complications have an opportunity to develop. Because the infection shares early signs with other seasonal ailments, recognizing its distinctive progression is a key first step toward recovery.',
      },
      {
        type: 'h2',
        text: 'What Is Typhoid Fever?',
      },
      {
        type: 'p',
        text: 'Typhoid fever is caused by a specific strain of bacterium known as Salmonella enterica serovar Typhi. Unlike other foodborne organisms that stay confined to the digestive tract, this bacterium can pass through the intestinal lining into the bloodstream, circulating throughout the body. Once inside the bloodstream, it multiplies and targets vital organs including the liver, spleen, and bone marrow.',
      },
      {
        type: 'p',
        text: 'Humans are the only natural hosts for typhoid bacteria. This means the infection does not jump from animal reservoirs; rather, it cycles between people through fecal-oral transmission when food, water, or cooking surfaces become contaminated by an infected person or an asymptomatic carrier.',
      },
      {
        type: 'h2',
        text: 'Common Signs and Progressive Symptoms',
      },
      {
        type: 'p',
        text: 'Unlike viral stomach bugs that strike suddenly within hours, typhoid fever develops gradually over one to three weeks following exposure. Doctors often describe the hallmark temperature pattern as a "step-ladder fever" that climbs higher each day, often reaching notable elevations by the end of the first week.',
      },
      {
        type: 'ul',
        items: [
          'Persistent high fever that rises incrementally over several days',
          'Dull, persistent frontal headache accompanied by generalized muscle aches',
          'Profound exhaustion, weakness, and loss of appetite',
          'Stomach discomfort, bloating, and either constipation (common in adults) or loose stools (often seen in young children)',
          'Dry cough and a coated white tongue with red edges',
          'A faint, rose-colored rash consisting of small flat spots on the chest or abdomen',
        ],
      },
      {
        type: 'p',
        text: 'As the disease enters its second week without treatment, fatigue deepens, abdominal swelling increases, and the heart rate may appear unexpectedly slow relative to the elevated body temperature. By the third week, patients become profoundly weak and vulnerable to severe intestinal complications.',
      },
      {
        type: 'h2',
        text: 'How the Infection Spreads',
      },
      {
        type: 'p',
        text: 'Transmission occurs when an individual ingests food, water, or ice contaminated with microscopic traces of fecal matter carrying the bacteria. Street foods prepared without clean running water, raw vegetables washed in untreated water, and unpasteurized beverages are frequent culprits.',
      },
      {
        type: 'p',
        text: 'Importantly, a small percentage of individuals who recover from acute typhoid continue to harbor the bacteria in their gallbladder or intestinal tract without feeling sick. These individuals, known as chronic carriers, can shed the organism in their stool for months or even years, inadvertently passing the infection to others if strict hand hygiene is not observed before handling food.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Safe Dining and Travel Precautions',
        items: [
          'Drink only boiled, filtered, or commercially sealed bottled water when traveling.',
          'Avoid beverages served with ice cubes made from tap water.',
          'Eat thoroughly cooked foods served piping hot; avoid raw salads and unpeeled fruits.',
          'Wash hands thoroughly with soap and clean water before meals and after using the restroom.',
        ],
      },
      {
        type: 'h2',
        text: 'Medical Diagnosis and Treatment',
      },
      {
        type: 'p',
        text: 'A definitive diagnosis of typhoid cannot be made on physical signs alone because symptoms overlap with malaria, dengue, and viral gastroenteritis. A physician will typically order blood cultures or stool tests to isolate the bacteria and confirm antibiotic sensitivity. Early testing within the first week yields the most accurate culture results.',
      },
      {
        type: 'p',
        text: 'Antibiotic therapy is the cornerstone of treatment and must be prescribed by a licensed healthcare professional. Never self-medicate or purchase antibiotics over the counter, as bacterial resistance to older medications has risen sharply. Patients usually begin to feel noticeable improvement within two to four days after starting the correct antibiotic, but it is critical to finish the complete prescribed duration even after feeling well.',
      },
      {
        type: 'h2',
        text: 'Supportive Care and Daily Recovery Habits',
      },
      {
        type: 'p',
        text: 'Alongside targeted medical therapy, restorative self-care helps the body rebuild its strength while protecting delicate digestive tissues. Bed rest is strongly recommended during the acute febrile stage.',
      },
      {
        type: 'ul',
        items: [
          'Hydration: Drink oral rehydration solutions, clear broths, and boiled water regularly to replace lost fluids and electrolytes.',
          'Gentle nutrition: Consume soft, easily digestible foods such as rice porridge, boiled potatoes, soups, and bananas. Avoid high-fiber, greasy, or spicy dishes that irritate the inflamed bowel.',
          'Temperature management: Use lukewarm sponge baths and doctor-approved fever reducers to stay comfortable.',
          'Personal hygiene: Disinfect bathroom surfaces frequently and ensure dedicated towels and utensils until medical clearance is confirmed.',
        ],
      },
      {
        type: 'h2',
        text: 'When to Seek Urgent Medical Care',
      },
      {
        type: 'p',
        text: 'While modern medical care makes typhoid highly curable, untreated or delayed cases risk severe internal bleeding or bowel perforation, which are surgical emergencies requiring immediate hospital admission.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Emergency Warning Signs',
        items: [
          'Sudden, sharp, or worsening abdominal pain that becomes tender to the touch',
          'Vomiting blood or noticing black, tarry, or bloody stools',
          'High fever that fails to respond to prescribed medication after three days',
          'Severe confusion, delirium, extreme lethargy, or inability to stay awake',
          'Signs of severe dehydration, including dry mouth, sunken eyes, and lack of urination',
        ],
      },
    ],
  },
  {
    slug: 'pcos-symptoms-causes-and-management',
    title: 'PCOS: Symptoms, Causes and Management',
    excerpt:
      'Understand the hormonal imbalance behind PCOS and lifestyle changes that help.',
    image: 'https://i.ibb.co.com/4Zy591t3/PCOD-and-PCOS-8b2cddcc09.jpg',
    imagePosition: 'center',
    category: 'Gynecologist',
    publishedAt: '2026-11-18T14:30:00Z',
    author: 'Prescripto Editorial Team',
    takeaways: [
      'Polycystic Ovary Syndrome is a complex endocrine condition involving an imbalance of reproductive and metabolic hormones.',
      'Key signs include irregular or absent periods, elevated androgens leading to acne or excess hair, and multi-follicular ovaries on ultrasound.',
      'Sustainable nutritional choices, regular movement, stress moderation, and personalized medical care provide lasting symptom relief.',
    ],
    content: [
      {
        type: 'p',
        text: 'Polycystic Ovary Syndrome, commonly referred to as PCOS, is one of the most frequent hormonal conditions encountered by women of reproductive age. Despite how common it is, many individuals spend months or years wondering why their menstrual cycles are unpredictable, why their energy fluctuates, or why stubborn skin breakouts persist. Gaining a clear understanding of what happens inside the body removes frustration and opens the door to proactive, evidence-based management.',
      },
      {
        type: 'h2',
        text: 'What Is Polycystic Ovary Syndrome?',
      },
      {
        type: 'p',
        text: 'PCOS is not solely a disorder of the ovaries; it is fundamentally an endocrine and metabolic condition. In a typical menstrual cycle, follicles develop within the ovary and one dominant follicle matures to release an egg during ovulation. In individuals with PCOS, subtle hormonal signals fall out of sync, preventing follicles from maturing fully. Instead, numerous small, harmless fluid-filled sacs remain clustered within the ovary, giving it a distinctive appearance on medical ultrasound.',
      },
      {
        type: 'p',
        text: 'Because regular ovulation does not occur, the ovaries produce lower levels of progesterone while continuing to produce small amounts of androgens, often called male hormones, which are naturally present in women in smaller quantities. This imbalance drives many of the physical symptoms associated with the condition.',
      },
      {
        type: 'h2',
        text: 'Common Signs and Symptoms',
      },
      {
        type: 'p',
        text: 'Symptoms of PCOS can vary dramatically from person to person. One woman may experience infrequent periods alongside hair thinning, while another may have regular bleeding but struggle with metabolic sluggishness and persistent cystic acne.',
      },
      {
        type: 'ul',
        items: [
          'Irregular, delayed, or absent menstrual cycles (fewer than eight periods in a calendar year)',
          'Prolonged or unusually heavy bleeding when periods do occur',
          'Excess hair growth (hirsutism) on the chin, upper lip, chest, abdomen, or inner thighs',
          'Persistent adult acne, particularly along the jawline and lower face, resistant to standard topical creams',
          'Thinning hair on the crown of the scalp resembling female-pattern hair loss',
          'Darkened, velvety patches of skin (acanthosis nigricans) around the neck creases, underarms, or groin',
          'Difficulty managing weight, especially around the midsection, despite consistent dietary efforts',
        ],
      },
      {
        type: 'h2',
        text: 'Contributing Factors and Insulin Resistance',
      },
      {
        type: 'p',
        text: 'While the exact origin of PCOS involves a combination of genetic predisposition and environmental factors, insulin resistance sits at the core of the condition for a majority of women. Insulin is the hormone produced by the pancreas to move glucose from the bloodstream into cells for energy.',
      },
      {
        type: 'p',
        text: 'When body cells become resistant to insulin signals, the pancreas compensates by pumping out higher quantities of insulin into the circulation. Excess circulating insulin acts directly on the ovaries, stimulating them to produce surplus androgens. High insulin also lowers levels of sex hormone-binding globulin, freeing up even more active testosterone in the bloodstream.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Core Pillars of Long-Term Health',
        items: [
          'Balanced blood sugar: Prioritize fiber, lean proteins, and unrefined grains to curb insulin spikes.',
          'Consistent physical activity: Resistance training and brisk walking increase muscular insulin sensitivity.',
          'Restorative sleep: Inadequate rest elevates cortisol, which further destabilizes insulin regulation.',
          'Emotional well-being: Chronic stress amplifies hormonal disruption; gentle mindfulness and community support make a measurable difference.',
        ],
      },
      {
        type: 'h2',
        text: 'Clinical Diagnosis and Treatment Options',
      },
      {
        type: 'p',
        text: 'To establish a formal diagnosis, medical guidelines generally require meeting at least two of three criteria: irregular or absent ovulation, clinical or biochemical evidence of elevated androgens, and polycystic ovarian appearance on pelvic ultrasound, after excluding other conditions such as thyroid disorders or hyperprolactinemia.',
      },
      {
        type: 'p',
        text: 'Medical treatment is always tailored to each person’s individual priorities, whether that involves regulating the menstrual cycle, clearing skin, or planning a future pregnancy. A gynecologist may recommend cycle-regulating medications, anti-androgen therapies, or insulin-sensitizing options. These medical treatments work in synergy with sustainable daily lifestyle habits.',
      },
      {
        type: 'h2',
        text: 'Everyday Nutrition and Movement Strategies',
      },
      {
        type: 'p',
        text: 'Managing PCOS does not require extreme calorie restriction or grueling exercise routines. In fact, severe dieting often triggers stress hormones that worsen ovulation suppression. Gentle, steady habits create far better long-term outcomes.',
      },
      {
        type: 'ul',
        items: [
          'Pair carbohydrates with protein or healthy fats at every meal to slow down sugar absorption.',
          'Emphasize colorful vegetables, legumes, seeds, olive oil, and nuts rich in anti-inflammatory antioxidants.',
          'Incorporate strength training two to three times weekly to build metabolically active muscle mass.',
          'Take short 10-minute walks after meals to facilitate natural glucose uptake into muscle cells.',
        ],
      },
      {
        type: 'h2',
        text: 'When to Consult a Gynecologist',
      },
      {
        type: 'p',
        text: 'Regular gynecological checkups are essential for monitoring uterine lining health. When periods occur less than every three months, the endometrium can build up excessively, requiring medical evaluation.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Red-Flag Situations Requiring Immediate Evaluation',
        items: [
          'Heavy vaginal bleeding that soaks through two or more pads per hour for more than two consecutive hours',
          'Sudden, severe pelvic pain that does not subside with rest or mild over-the-counter pain relievers',
          'Complete absence of menstrual bleeding for more than four consecutive months without pregnancy',
          'Unexplained dizzy spells, fainting, or severe shortness of breath during heavy bleeding episodes',
        ],
      },
    ],
  },
  {
    slug: 'eczema-symptoms-triggers-and-relief',
    title: 'Eczema: Symptoms, Triggers and Relief',
    excerpt:
      'Explore what causes eczema flare-ups and treatments that provide lasting relief.',
    image: 'https://i.ibb.co.com/B21bZRT6/en3593113.jpg',
    imagePosition: 'center 20%',
    category: 'Dermatologist',
    publishedAt: '2026-11-15T11:15:00Z',
    author: 'Prescripto Editorial Team',
    takeaways: [
      'Eczema is a chronic inflammatory skin condition marked by an impaired moisture barrier and hyper-reactive immune responses.',
      'The itch-scratch cycle damages the outer skin layer, leaving it vulnerable to environmental allergens and secondary bacterial infection.',
      'Daily barrier repair through thick fragrance-free moisturizers, lukewarm baths, and doctor-prescribed topicals provides dependable control.',
    ],
    content: [
      {
        type: 'p',
        text: 'Eczema, most frequently presenting as atopic dermatitis, is a chronic inflammatory condition that affects millions of children and adults worldwide. Living with eczema means managing not only visible skin irritation but also the relentless, sleep-disrupting itch that often accompanies it. Fortunately, advances in dermatological science have transformed how we approach this condition, moving from temporary fixes to proactive, long-term barrier protection.',
      },
      {
        type: 'h2',
        text: 'What Is Eczema?',
      },
      {
        type: 'p',
        text: 'To understand eczema, it helps to picture healthy skin as a sturdy brick wall. The skin cells are the bricks, and natural lipids and proteins form the mortar holding everything securely in place. In people with eczema, genetic variations often lead to a deficiency in key structural proteins such as filaggrin, leaving microscopic gaps in the mortar.',
      },
      {
        type: 'p',
        text: 'Because of this leaky barrier, moisture readily evaporates from the deeper layers of skin, leading to chronic dryness. Simultaneously, external irritants, pollen, dust mites, and bacteria easily penetrate the weakened barrier, triggering an overactive immune reaction that produces redness, warmth, swelling, and intense itching.',
      },
      {
        type: 'h2',
        text: 'Recognizing Common Symptoms and Flare-Up Stages',
      },
      {
        type: 'p',
        text: 'Eczema symptoms can fluctuate between periods of relatively calm skin and sudden, uncomfortable flare-ups. The appearance of eczema lesions often differs depending on age, skin tone, and chronicity.',
      },
      {
        type: 'ul',
        items: [
          'Intense, persistent itching that frequently worsens during the evening and night hours',
          'Dry, sensitive patches that look red on lighter skin tones or purple, grayish-brown, or dark brown on deeper complexions',
          'Rough, scaly, or cracked patches located primarily in the creases of elbows, behind knees, around wrists, ankles, and neck',
          'Small, raised bumps that may ooze clear fluid and crust over when scratched',
          'Thickened, leathery skin (lichenification) resulting from chronic, repetitive scratching over months or years',
        ],
      },
      {
        type: 'h2',
        text: 'Identifying and Minimizing Everyday Triggers',
      },
      {
        type: 'p',
        text: 'While the underlying tendency toward eczema is rooted in genetics and immune function, individual flare-ups are almost always sparked by environmental triggers. Keeping a simple symptom diary helps pinpoint specific culprits in daily life.',
      },
      {
        type: 'p',
        text: 'Common irritants include commercial laundry detergents containing harsh fragrances or optical brighteners, bar soaps with high alkaline pH levels, and synthetic or wool fabrics that abrade delicate skin. Weather shifts, particularly dry winter indoor heating or excessive summer sweat, also place stress on the skin barrier.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'The Golden Three-Minute Rule',
        items: [
          'Bathe in lukewarm water rather than hot water, limiting shower duration to 5 to 10 minutes.',
          'Use mild, fragrance-free, soap-free cleansers only on areas that truly need washing.',
          'Pat skin lightly with a clean towel, leaving the skin slightly damp.',
          'Within three minutes of stepping out of the shower, apply a generous layer of thick ointment or cream to trap essential moisture before it evaporates.',
        ],
      },
      {
        type: 'h2',
        text: 'Medical Treatments and Barrier Restoration',
      },
      {
        type: 'p',
        text: 'A board-certified dermatologist creates a treatment plan designed to extinguish active inflammation and subsequently maintain skin barrier resilience. During active flare-ups, short courses of topical anti-inflammatory ointments or non-steroidal topical calcineurin inhibitors are commonly prescribed to calm the immune response.',
      },
      {
        type: 'p',
        text: 'For moderate to severe cases that do not respond sufficiently to topicals alone, newer targeted therapies, phototherapy (controlled ultraviolet light), or oral immunomodulators offer remarkable relief. Never apply leftover prescription creams from friends or family members without a direct dermatological examination.',
      },
      {
        type: 'h2',
        text: 'At-Home Skin Care Habits for Lasting Relief',
      },
      {
        type: 'p',
        text: 'Consistent daily routines are the foundation of healthy skin maintenance. Even when skin looks clear, continuing daily moisturizing keeps the barrier reinforced and wards off future flares.',
      },
      {
        type: 'ul',
        items: [
          'Choose thick ointments (like petroleum jelly) or heavy creams over thin pump lotions, which contain higher water and preservative content.',
          'Wear soft, breathable 100% cotton clothing and wash new garments before wearing them.',
          'Keep fingernails trimmed short and smooth to minimize skin damage from involuntary nighttime scratching.',
          'Consider running a cool-mist humidifier in the bedroom during dry winter months.',
        ],
      },
      {
        type: 'h2',
        text: 'When to Seek Dermatological Attention',
      },
      {
        type: 'p',
        text: 'Because eczema breaks the skin’s defensive seal, bacterial and viral infections can take hold rapidly. Recognizing early signs of infection ensures swift medical intervention before systemic complications arise.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Signs of Secondary Infection Requiring Prompt Care',
        items: [
          'Yellow, honey-colored crusting or oozing pus appearing on eczema patches',
          'Rapidly spreading redness, swelling, warmth, or increasing pain around the affected skin',
          'Clusters of small, painful blisters resembling cold sores on areas of active eczema (possible viral infection)',
          'Fever, chills, or generally feeling unwell alongside a sudden worsening skin flare',
          'Eczema that disrupts daily functioning, causes chronic insomnia, or fails to improve after two weeks of prescribed therapy',
        ],
      },
    ],
  },
  {
    slug: 'chickenpox-in-children-what-parents-should-know',
    title: 'Chickenpox in Children: What Parents Should Know',
    excerpt:
      'A guide to spotting chickenpox early and knowing when to see a doctor.',
    image: 'https://i.ibb.co.com/LyK4TqY/Chickenpox.webp',
    imagePosition: 'center',
    category: 'Pediatricians',
    publishedAt: '2026-11-12T08:45:00Z',
    author: 'Prescripto Editorial Team',
    takeaways: [
      'Chickenpox is a highly contagious childhood viral illness caused by the varicella-zoster virus.',
      'The classic rash progresses through three distinctive stages: itchy red spots, fluid-filled blisters, and dry scabs.',
      'Care focuses on soothing itchiness, keeping the child hydrated, and vigilantly monitoring for secondary bacterial skin infections.',
    ],
    content: [
      {
        type: 'p',
        text: 'For generations of parents, a sudden outbreak of itchy red spots on a child’s stomach or back has signaled the arrival of chickenpox. While vaccination programs have dramatically reduced the frequency of this childhood milestone in many countries, cases still occur regularly in school-age children and toddlers. Knowing what to expect as the illness unfolds provides parents with reassurance and practical tools to keep their little ones comfortable and safe.',
      },
      {
        type: 'h2',
        text: 'Understanding Chickenpox in Children',
      },
      {
        type: 'p',
        text: 'Chickenpox is caused by the varicella-zoster virus, a member of the herpesvirus family. It is exceptionally contagious: when an infected person coughs or sneezes, tiny viral particles travel through the air and can easily infect anyone in the vicinity who lacks immunity. Direct contact with fluid leaking from active blisters also transmits the virus.',
      },
      {
        type: 'p',
        text: 'After a child is exposed, there is an incubation period lasting typically between 10 and 21 days before any visible signs appear. During the last one to two days of this incubation period—before even a single spot emerges—the child is already contagious to others. Contagiousness continues until every single blister has dried and formed a solid scab, usually about five to seven days after the first spots appear.',
      },
      {
        type: 'h2',
        text: 'Stages of the Chickenpox Rash and Symptoms',
      },
      {
        type: 'p',
        text: 'Before the iconic rash appears, children often experience mild prodromal symptoms for one to two days. These early indicators can easily be mistaken for a common cold.',
      },
      {
        type: 'ul',
        items: [
          'Mild fever, often accompanied by general irritability, tiredness, and reduced appetite',
          'Sore throat and mild headache',
          'Stage 1 (Spots): Small, itchy red or pink bumps appear on the chest, back, and face before spreading across the entire body, including the scalp and mouth.',
          'Stage 2 (Blisters): Within 12 to 24 hours, the bumps transform into intensely itchy, fluid-filled blisters that look like tiny dewdrops on a red base.',
          'Stage 3 (Scabbing): The blisters break open, weep slightly, and crust over to form dry scabs over the next several days.',
        ],
      },
      {
        type: 'p',
        text: 'A hallmark characteristic of chickenpox is that all three stages coexist simultaneously on different parts of the body, as new waves of spots emerge over a three-to-five day window.',
      },
      {
        type: 'h2',
        text: 'Comfort Measures and Practical Home Care',
      },
      {
        type: 'p',
        text: 'Because chickenpox is a viral infection, antibiotics are ineffective against the virus itself. The primary objective is to keep the child rested, hydrated, and to prevent aggressive scratching that can tear delicate skin tissues.',
      },
      {
        type: 'ul',
        items: [
          'Lukewarm oatmeal baths: Soak the child in a lukewarm bath containing finely ground colloidal oatmeal for 15 minutes to soothe inflamed nerve endings.',
          'Gentle patting: Gently pat the skin dry with a soft, clean towel—never rub or scrub active blisters.',
          'Calamine lotion: Dab cool calamine lotion directly onto individual itchy spots, taking care to avoid areas close to the eyes and mouth.',
          'Trim fingernails: Keep the child’s nails clipped very short and clean. For younger infants and toddlers, placing soft cotton mittens or socks on their hands during sleep prevents night scratching.',
          'Loose cotton attire: Dress children in lightweight, breathable cotton sleepwear to prevent perspiration from worsening the itch.',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Critical Medication Safety Rule for Parents',
        items: [
          'NEVER give aspirin or products containing aspirin to any child or teenager suffering from chickenpox or viral illness, due to the serious risk of Reye syndrome, a life-threatening condition affecting the brain and liver.',
          'Consult your pediatrician before administering ibuprofen, as some clinical observations suggest NSAIDs may increase the risk of severe secondary bacterial skin infections in chickenpox patients.',
          'Pediatric paracetamol (acetaminophen) is generally the preferred option for fever discomfort, strictly following doctor or pharmacist dosage guidelines.',
        ],
      },
      {
        type: 'h2',
        text: 'Preventing Secondary Bacterial Infections',
      },
      {
        type: 'p',
        text: 'The most frequent complication in young children is a secondary bacterial skin infection caused by Staphylococcus or Streptococcus bacteria introduced under the skin via dirty fingernails while scratching. Keeping living spaces clean, encouraging frequent handwashing, and distracting young children with quiet games or stories helps reduce the urge to scratch.',
      },
      {
        type: 'h2',
        text: 'When to Contact a Pediatrician Immediately',
      },
      {
        type: 'p',
        text: 'While the majority of healthy children recover uneventfully within a week to ten days, severe complications can arise, especially in infants under one year of age or children with weakened immune systems.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Urgent Pediatric Warning Signs',
        items: [
          'The skin around individual blisters becomes intensely red, hot, swollen, or streaks of red radiate outward',
          'Blisters leak thick, yellowish-green pus rather than clear fluid',
          'High fever persisting beyond four days, or a fever that spikes again after initially resolving',
          'The child develops a severe persistent cough, rapid shallow breathing, or chest retractions',
          'Extreme lethargy, difficulty waking up, confusion, severe unsteady walking, or stiff neck',
          'Blisters develop inside the eye, on the cornea, or causing eyelid swelling',
        ],
      },
    ],
  },
  {
    slug: 'migraine-vs-headache-how-to-tell-the-difference',
    title: 'Migraine vs Headache: How to Tell the Difference',
    excerpt:
      'Learn the key differences and when a headache needs medical attention.',
    image: 'https://i.ibb.co.com/m5281jtj/images.jpg',
    imagePosition: 'center 25%',
    category: 'Neurologist',
    publishedAt: '2026-11-09T16:20:00Z',
    author: 'Prescripto Editorial Team',
    takeaways: [
      'A tension headache typically produces a steady, dull band of pressure across both sides of the head.',
      'A migraine is a complex neurological event involving pulsating, throbbing pain often accompanied by sensory sensitivity, nausea, or visual auras.',
      'Sudden "thunderclap" headaches, fever with neck stiffness, or focal neurological deficits require urgent emergency evaluation.',
    ],
    content: [
      {
        type: 'p',
        text: 'Almost everyone has experienced head pain at some point in their life. Whether triggered by a stressful workday, dehydration after exercise, or lack of sleep, head discomfort is one of the most common physical complaints in modern medicine. However, dismissing a full-blown migraine as "just a bad headache" can lead to years of inadequate treatment and unnecessary suffering. Distinguishing between ordinary tension headaches and genuine migraine episodes is crucial for finding targeted relief.',
      },
      {
        type: 'h2',
        text: 'Understanding Headaches Versus Migraines',
      },
      {
        type: 'p',
        text: 'The term "headache" encompasses a wide range of pain conditions, the most prevalent being tension-type headaches. Tension headaches arise when muscles in the neck, scalp, and jaw contract tightly in response to stress, poor posture, or physical fatigue. They are uncomfortable, but they rarely interfere completely with a person’s ability to walk, think, or perform routine tasks.',
      },
      {
        type: 'p',
        text: 'A migraine, by contrast, is not merely severe head pain; it is a primary neurological disorder characterized by widespread changes in brain wave activity, neurochemical signaling, and blood vessel dilation within the meninges. Migraine attacks frequently incapacitate individuals for hours or even days at a time.',
      },
      {
        type: 'h2',
        text: 'Comparing the Hallmarks of Both Conditions',
      },
      {
        type: 'p',
        text: 'Examining the quality, location, and accompanying features of your head discomfort helps clarify which condition you are navigating.',
      },
      {
        type: 'ul',
        items: [
          'Pain Quality: Tension headaches feel like a tight, squeezing rubber band wrapped around the forehead or temples. Migraines produce an intense, throbbing or pulsing pain that pulses with your heartbeat.',
          'Location: Tension headaches usually affect both sides of the head evenly. Migraines typically target one side of the head, though the pain can switch sides or radiate across both.',
          'Physical Activity: Routine movement like climbing stairs or bending over does not alter a tension headache significantly, but it markedly intensifies migraine agony.',
          'Sensory Sensitivities: Migraines are accompanied by heightened photophobia (light sensitivity), phonophobia (sound sensitivity), and sometimes osmophobia (sensitivity to everyday smells).',
          'Digestive Symptoms: Nausea, stomach upset, and actual vomiting are frequent with migraines but virtually unheard of in simple tension headaches.',
        ],
      },
      {
        type: 'h2',
        text: 'The Four Phases of a Migraine Attack',
      },
      {
        type: 'p',
        text: 'Unlike headaches that start and end with the pain, a complete migraine attack can unfold across four distinct phases over several days.',
      },
      {
        type: 'ul',
        items: [
          'Prodrome (Warning): One to two days prior to head pain, subtle cues appear—such as frequent yawning, unexplained food cravings, neck stiffness, mood shifts, or increased thirst.',
          'Aura: In about a quarter of migraineurs, temporary neurological disturbances occur 20 to 60 minutes before the headache begins. These include shimmering zigzag lines, blind spots, tingling in one hand, or difficulty finding words.',
          'Attack (Pain Phase): Severe throbbing pain, sensory hypersensitivity, and nausea that can last from 4 hours up to 72 hours if left unmanaged.',
          'Postdrome (The "Migraine Hangover"): After the severe pain subsides, individuals often feel drained, mentally foggy, achy, and exhausted for 24 to 48 hours.',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Keeping a Migraine Symptom Diary',
        items: [
          'Record the exact time pain starts and ends, its intensity on a 1-to-10 scale, and where it is located.',
          'Note food and drink intake from the preceding 24 hours, including caffeine consumption and meal timing.',
          'Track sleep duration, quality, and any notable emotional or environmental stressors.',
          'For women, log the timing relative to your menstrual cycle, as hormonal shifts are a potent migraine trigger.',
        ],
      },
      {
        type: 'h2',
        text: 'Everyday Habits and Neurological Care',
      },
      {
        type: 'p',
        text: 'Migraine-prone brains crave consistency. Maintaining steady routines for sleep, meal times, and hydration helps stabilize the neurological threshold against attacks. Avoiding known dietary triggers—such as aged cheeses, processed meats, and artificial sweeteners—can also reduce frequency.',
      },
      {
        type: 'p',
        text: 'When headaches occur frequently (more than four days a month) or severely impair quality of life, consulting a neurologist is the gold standard. Modern neurology offers targeted acute medications (taken at the first sign of pain) as well as preventative treatments designed to reduce attack frequency.',
      },
      {
        type: 'h2',
        text: 'Red-Flag Symptoms That Require Immediate Care',
      },
      {
        type: 'p',
        text: 'Certain headache symptoms may indicate a serious underlying neurological or vascular event that requires immediate emergency evaluation rather than home rest.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Emergency "Red Flag" Headache Signs',
        items: [
          'A sudden, explosive headache that peaks in intensity within seconds or minutes (a "thunderclap" headache)',
          'Headache accompanied by high fever, stiff neck, confusion, personality changes, or seizures',
          'Sudden weakness, numbness on one side of the face or body, difficulty speaking, or loss of balance',
          'New head pain developing after a head injury or traumatic fall',
          'A new type of headache in someone over age 50 or in someone with a history of cancer',
        ],
      },
    ],
  },
  {
    slug: 'acid-reflux-symptoms-causes-and-healing',
    title: 'Acid Reflux: Symptoms, Causes and Healing',
    excerpt:
      'Find out what triggers acid reflux and the changes that help you heal faster.',
    image: 'https://i.ibb.co.com/MD25XGGp/images-1.jpg',
    imagePosition: 'center',
    category: 'Gastroenterologist',
    publishedAt: '2026-11-05T10:00:00Z',
    author: 'Prescripto Editorial Team',
    takeaways: [
      'Acid reflux occurs when stomach acid travels backward through a relaxed lower esophageal sphincter into the delicate esophagus.',
      'Symptoms range from classic retrosternal burning (heartburn) to silent signs like throat clearing, chronic cough, and bitter taste.',
      'Strategic lifestyle changes, meal timing, and guidance from a gastroenterologist support esophageal mucosal healing and prevent complications.',
    ],
    content: [
      {
        type: 'p',
        text: 'Almost everyone is familiar with that uncomfortable burning sensation rising behind the breastbone after an indulgent, heavy dinner. While occasional heartburn is a common nuisance, frequent or persistent acid reflux should not be casually brushed aside as harmless indigestion. When acid repeatedly flows backward into the esophagus, it irritates delicate mucosal tissues and can evolve into Gastroesophageal Reflux Disease (GERD). Taking thoughtful steps toward healing protects both comfort and digestive longevity.',
      },
      {
        type: 'h2',
        text: 'What Is Acid Reflux and GERD?',
      },
      {
        type: 'p',
        text: 'At the junction where the esophagus meets the stomach lies a specialized ring of muscular tissue called the Lower Esophageal Sphincter (LES). In healthy digestion, the LES acts as a dependable one-way valve: it opens briefly to allow swallowed food and liquids to pass into the stomach, then clamps firmly shut to seal stomach contents inside.',
      },
      {
        type: 'p',
        text: 'Acid reflux occurs when this muscular valve relaxes inappropriately or becomes mechanically weakened. Because the stomach is lined with robust mucosal barriers designed to withstand strong hydrochloric acid, it remains unharmed. The esophagus, however, lacks this thick protective shielding, leading to immediate inflammation, pain, and tissue irritation.',
      },
      {
        type: 'h2',
        text: 'Common and "Silent" Signs of Reflux',
      },
      {
        type: 'p',
        text: 'While classic heartburn is the most recognizable symptom, many individuals suffer from "silent reflux" (Laryngopharyngeal Reflux), where acid vapors irritate the throat and vocal cords without obvious chest burning.',
      },
      {
        type: 'ul',
        items: [
          'Heartburn: A persistent burning sensation behind the breastbone that commonly rises toward the throat after meals or upon lying down',
          'Regurgitation: A sour, bitter fluid washing up into the back of the mouth or throat',
          'Frequent throat clearing, persistent hoarseness, or feeling a stubborn "lump" in the throat (globus sensation)',
          'Chronic, unexplained dry cough that worsens at night or early in the morning',
          'Difficulty or mild pain when swallowing dry or coarse foods',
          'Unexplained enamel wear on back molars caused by nighttime acid exposure',
        ],
      },
      {
        type: 'h2',
        text: 'Root Causes and Everyday Triggers',
      },
      {
        type: 'p',
        text: 'Several mechanical and dietary factors can compromise the lower esophageal sphincter or increase intra-abdominal pressure, forcing stomach acid upward.',
      },
      {
        type: 'p',
        text: 'Dietary triggers include acidic foods like citrus fruits and tomatoes, high-fat greasy meals that delay stomach emptying, chocolate, caffeine, mint, and carbonated beverages that naturally relax the sphincter muscle. Eating late at night and lying flat before food has emptied from the stomach removes the helpful downward pull of gravity, allowing acid to pool in the esophagus.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Everyday Habit Adjustments for Reflux Relief',
        items: [
          'Wait at least three hours after your last meal or snack before lying down to sleep.',
          'Eat moderate, evenly spaced meals rather than large, distending dinners.',
          'Elevate the head of your bed by 6 inches using bed risers or an orthopedic wedge pillow (extra pillows alone simply bend the neck without elevating the torso).',
          'Avoid tight-fitting belts, corsets, and restrictive waistbands that push against the stomach.',
          'Sleep preferentially on your left side, which places the gastroesophageal junction above the gastric pool.',
        ],
      },
      {
        type: 'h2',
        text: 'Medical Evaluation and Esophageal Healing',
      },
      {
        type: 'p',
        text: 'When acid reflux occurs more than twice a week or fails to improve with simple dietary changes, an evaluation by a gastroenterologist is strongly advised. A specialist can perform tests—such as an upper endoscopy (EGD) or ambulatory acid monitoring—to examine the esophageal lining for microscopic damage, strictures, or a pre-cancerous condition known as Barrett esophagus.',
      },
      {
        type: 'p',
        text: 'Medical therapies prescribed by doctors include antacids for quick situational relief, H2 blockers to dampen acid production, or proton pump inhibitors (PPIs) to provide the prolonged acid reduction necessary for mucosal ulcerations to heal. Medications should always be taken under direct medical guidance and reviewed periodically.',
      },
      {
        type: 'h2',
        text: 'When to Seek Immediate Medical Evaluation',
      },
      {
        type: 'p',
        text: 'Because symptoms of severe acid reflux can closely mimic cardiac events, chest pain must never be casually dismissed as heartburn without professional medical verification.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Critical Warning Signs Requiring Prompt Medical Attention',
        items: [
          'Severe chest pain, pressure, squeezing, or heaviness that radiates to the neck, jaw, shoulder, or arm (seek emergency care immediately)',
          'Difficulty swallowing (food feeling stuck in the chest) or painful swallowing (odynophagia)',
          'Vomiting blood or noticing material that resembles dark coffee grounds in vomit',
          'Passing dark, tarry, or black stools, which indicates internal gastrointestinal bleeding',
          'Unintended weight loss accompanied by chronic nausea or loss of appetite',
        ],
      },
    ],
  },
]

/**
 * Calculates estimated reading time in minutes based on ~200 wpm.
 * Rounded up, minimum 1 minute.
 */
export const calculateReadingTime = (blog) => {
  if (!blog || !blog.content) return 1
  let wordCount = 0

  if (blog.title) wordCount += blog.title.split(/\s+/).filter(Boolean).length
  if (blog.excerpt) wordCount += blog.excerpt.split(/\s+/).filter(Boolean).length
  if (blog.takeaways && Array.isArray(blog.takeaways)) {
    wordCount += blog.takeaways.join(' ').split(/\s+/).filter(Boolean).length
  }

  if (Array.isArray(blog.content)) {
    blog.content.forEach((block) => {
      if (block.text) {
        wordCount += block.text.split(/\s+/).filter(Boolean).length
      }
      if (block.title) {
        wordCount += block.title.split(/\s+/).filter(Boolean).length
      }
      if (Array.isArray(block.items)) {
        wordCount += block.items.join(' ').split(/\s+/).filter(Boolean).length
      }
    })
  }

  const minutes = Math.ceil(wordCount / 200)
  return Math.max(1, minutes)
}

/**
 * Look up a single blog post by its URL slug.
 */
export const getBlogBySlug = (slug) => {
  if (!slug) return undefined
  return blogsData.find((b) => b.slug === slug.toLowerCase().trim())
}
