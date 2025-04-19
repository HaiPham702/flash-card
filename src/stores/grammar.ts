import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { GrammarDay, GrammarTopic, GrammarSearchResult } from '@/types/grammar'

export const useGrammarStore = defineStore('grammar', () => {
  const grammarDays = ref<GrammarDay[]>([])
  const grammarTopics = ref<GrammarTopic[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Fetch all grammar days data
  const fetchGrammarDays = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // Normally this would be an API call to your backend
      // For now, we'll use mock data
      grammarDays.value = generateMockGrammarDays()
      return grammarDays.value
    } catch (err) {
      console.error('Error fetching grammar days:', err)
      error.value = 'Failed to load grammar data'
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Fetch a specific grammar day by ID
  const fetchGrammarDay = async (dayId: number) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Normally an API call
      const day = grammarDays.value.find(d => d.id === dayId)
      return day || null
    } catch (err) {
      console.error(`Error fetching grammar day ${dayId}:`, err)
      error.value = 'Failed to load grammar day'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Search for grammar topics
  const searchGrammarTopics = (query: string): GrammarSearchResult[] => {
    const lowerQuery = query.toLowerCase().trim()
    
    // Search in days and topics
    return grammarDays.value
      .filter(day => 
        day.title.toLowerCase().includes(lowerQuery) || 
        day.topics.some(topic => topic.toLowerCase().includes(lowerQuery))
      )
      .map(day => ({
        id: `day-${day.id}`,
        title: day.title,
        description: day.topics.join(', '),
        type: 'day' as const
      }))
  }

  return {
    grammarDays,
    grammarTopics,
    isLoading,
    error,
    fetchGrammarDays,
    fetchGrammarDay,
    searchGrammarTopics
  }
})

// Helper function to generate mock data for the 35-day grammar plan
function generateMockGrammarDays(): GrammarDay[] {
  return [
    {
      id: 1,
      title: 'Từ loại và Danh từ (1)',
      topics: ['Từ loại', 'Danh từ (1)'],
      level: 'basic',
      explanation: `
        <p><strong>Từ loại trong tiếng Anh</strong> gồm 8 loại chính:</p>
        <ul>
          <li>Noun (Danh từ): people, city, happiness</li>
          <li>Verb (Động từ): run, eat, think</li>
          <li>Adjective (Tính từ): happy, big, interesting</li>
          <li>Adverb (Trạng từ): quickly, very, well</li>
          <li>Pronoun (Đại từ): I, you, they</li>
          <li>Preposition (Giới từ): in, on, under</li>
          <li>Conjunction (Liên từ): and, but, because</li>
          <li>Interjection (Thán từ): oh, wow, ouch</li>
        </ul>
        
        <p><strong>Danh từ (Noun)</strong> là từ dùng để gọi tên người, vật, địa điểm, khái niệm.</p>
        <p>Danh từ được chia thành các loại sau:</p>
        <ul>
          <li>Danh từ riêng (Proper nouns): John, Paris, Monday</li>
          <li>Danh từ chung (Common nouns): boy, city, day</li>
          <li>Danh từ đếm được (Countable nouns): book, car, student</li>
          <li>Danh từ không đếm được (Uncountable nouns): water, music, information</li>
          <li>Danh từ tập thể (Collective nouns): team, family, group</li>
          <li>Danh từ trừu tượng (Abstract nouns): love, freedom, knowledge</li>
        </ul>
      `,
      examples: [
        {
          text: "Sarah visited London last summer.",
          translation: "Sarah đã thăm London mùa hè năm ngoái.",
          explanation: "Sarah và London là danh từ riêng, summer là danh từ chung."
        },
        {
          text: "The team is working hard on the project.",
          translation: "Đội đang làm việc chăm chỉ trên dự án.",
          explanation: "Team là danh từ tập thể, project là danh từ chung."
        },
        {
          text: "She gave me some useful information.",
          translation: "Cô ấy đã cho tôi một số thông tin hữu ích.",
          explanation: "Information là danh từ không đếm được."
        }
      ]
    },
    {
      id: 2,
      title: 'Lượng từ, Sở hữu và Đại từ',
      topics: ['Lượng từ', 'Sở hữu', 'Đại từ'],
      level: 'basic',
      explanation: `
        <p><strong>Lượng từ (Quantifiers)</strong> là từ chỉ số lượng, được sử dụng trước danh từ:</p>
        <ul>
          <li>a/an, some, any, many, much, a lot of, few, little, several, all, both, enough, ...</li>
        </ul>
        
        <p><strong>Sở hữu (Possessive)</strong> dùng để chỉ sự sở hữu hoặc mối quan hệ giữa người hoặc vật:</p>
        <ul>
          <li>Tính từ sở hữu (Possessive adjectives): my, your, his, her, its, our, their</li>
          <li>Đại từ sở hữu (Possessive pronouns): mine, yours, his, hers, its, ours, theirs</li>
          <li>Dạng sở hữu 's: John's book, the cat's tail</li>
        </ul>
        
        <p><strong>Đại từ (Pronouns)</strong> là từ dùng để thay thế danh từ:</p>
        <ul>
          <li>Đại từ nhân xưng (Personal pronouns): I, you, he, she, it, we, they</li>
          <li>Đại từ phản thân (Reflexive pronouns): myself, yourself, himself, ...</li>
          <li>Đại từ chỉ định (Demonstrative pronouns): this, that, these, those</li>
          <li>Đại từ nghi vấn (Interrogative pronouns): who, whom, which, what</li>
          <li>Đại từ quan hệ (Relative pronouns): who, whom, which, that</li>
        </ul>
      `,
      examples: [
        {
          text: "I have many books but only a little time to read them.",
          translation: "Tôi có nhiều sách nhưng chỉ có một chút thời gian để đọc chúng.",
          explanation: "Many (lượng từ dùng với danh từ đếm được - books), a little (lượng từ dùng với danh từ không đếm được - time)"
        },
        {
          text: "This is my car. That car is yours.",
          translation: "Đây là xe của tôi. Xe kia là của bạn.",
          explanation: "My (tính từ sở hữu), yours (đại từ sở hữu)"
        },
        {
          text: "She made this cake herself.",
          translation: "Cô ấy tự làm chiếc bánh này.",
          explanation: "She (đại từ nhân xưng), herself (đại từ phản thân)"
        }
      ]
    },
    {
      id: 3,
      title: 'Ôn tập và Kiểm tra',
      topics: ['Review (Day 1 - Day 2)', 'Mini-test 1'],
      level: 'review',
      explanation: `
        <p>Hôm nay chúng ta sẽ ôn tập lại kiến thức về:</p>
        <ul>
          <li>Các từ loại trong tiếng Anh</li>
          <li>Danh từ và các loại danh từ</li>
          <li>Lượng từ</li>
          <li>Sở hữu</li>
          <li>Đại từ</li>
        </ul>
        <p>Sau đó làm bài kiểm tra mini để đánh giá mức độ hiểu bài.</p>
      `,
      examples: []
    },
    {
      id: 4,
      title: 'Giới từ, Tính từ và Trạng từ',
      topics: ['Giới từ chỉ vị trí, chuyển động và thời gian', 'Tính từ', 'Trạng từ'],
      level: 'basic',
      explanation: `
        <p><strong>Giới từ (Prepositions)</strong> là từ chỉ mối quan hệ giữa các từ trong câu:</p>
        <ul>
          <li>Giới từ chỉ vị trí: in, on, at, under, above, between, among, ...</li>
          <li>Giới từ chỉ chuyển động: to, from, into, onto, across, through, ...</li>
          <li>Giới từ chỉ thời gian: at, in, on, during, for, since, ...</li>
        </ul>
        
        <p><strong>Tính từ (Adjectives)</strong> là từ dùng để mô tả danh từ:</p>
        <ul>
          <li>Vị trí: thường đứng trước danh từ hoặc sau động từ liên kết</li>
          <li>Thứ tự của tính từ: opinion - size - age - shape - color - origin - material - purpose</li>
          <li>So sánh hơn và so sánh nhất</li>
        </ul>
        
        <p><strong>Trạng từ (Adverbs)</strong> là từ mô tả động từ, tính từ hoặc trạng từ khác:</p>
        <ul>
          <li>Trạng từ chỉ cách thức: quickly, carefully, well</li>
          <li>Trạng từ chỉ thời gian: now, soon, already</li>
          <li>Trạng từ chỉ nơi chốn: here, there, everywhere</li>
          <li>Trạng từ chỉ mức độ: very, too, enough</li>
          <li>Trạng từ chỉ tần suất: always, often, never</li>
        </ul>
      `,
      examples: [
        {
          text: "The book is on the table in the living room.",
          translation: "Quyển sách ở trên bàn trong phòng khách.",
          explanation: "On và in là giới từ chỉ vị trí"
        },
        {
          text: "She wore a beautiful red silk dress.",
          translation: "Cô ấy mặc một chiếc váy lụa đỏ đẹp.",
          explanation: "Beautiful (tính từ chỉ ý kiến), red (tính từ chỉ màu sắc), silk (tính từ chỉ chất liệu)"
        },
        {
          text: "He speaks English fluently and confidently.",
          translation: "Anh ấy nói tiếng Anh trôi chảy và tự tin.",
          explanation: "Fluently và confidently là trạng từ chỉ cách thức"
        }
      ]
    },
    {
      id: 5,
      title: 'Ôn tập và Kiểm tra',
      topics: ['Review (Day 4)', 'Mini-test 2'],
      level: 'review',
      explanation: `
        <p>Hôm nay chúng ta sẽ ôn tập lại kiến thức về:</p>
        <ul>
          <li>Giới từ chỉ vị trí, chuyển động và thời gian</li>
          <li>Tính từ và vị trí của tính từ</li>
          <li>Trạng từ và các loại trạng từ</li>
        </ul>
        <p>Sau đó làm bài kiểm tra mini để đánh giá mức độ hiểu bài.</p>
      `,
      examples: []
    },
    {
      id: 6,
      title: 'Động từ To be và Thì hiện tại',
      topics: ['Động từ To be', 'Thì hiện tại tiếp diễn', 'Thì hiện tại đơn'],
      level: 'basic',
      explanation: `
        <p><strong>Động từ To be (am/is/are)</strong> là một trong những động từ quan trọng nhất trong tiếng Anh:</p>
        <ul>
          <li>Hiện tại: I am, you are, he/she/it is, we/you/they are</li>
          <li>Quá khứ: I/he/she/it was, you/we/they were</li>
          <li>Dạng phủ định: am not, is not (isn't), are not (aren't)</li>
          <li>Dạng câu hỏi: Am I? Is he/she/it? Are you/we/they?</li>
        </ul>
        
        <p><strong>Thì hiện tại tiếp diễn (Present Continuous)</strong> diễn tả hành động đang diễn ra tại thời điểm nói:</p>
        <ul>
          <li>Cấu trúc: Subject + am/is/are + V-ing</li>
          <li>Ví dụ: She is reading a book.</li>
        </ul>
        
        <p><strong>Thì hiện tại đơn (Present Simple)</strong> diễn tả sự thật, thói quen hoặc hành động lặp đi lặp lại:</p>
        <ul>
          <li>Cấu trúc: Subject + V (thêm -s/-es với ngôi thứ 3 số ít)</li>
          <li>Ví dụ: I work. / He works.</li>
        </ul>
      `,
      examples: [
        {
          text: "I am a student. My brother is a doctor.",
          translation: "Tôi là sinh viên. Anh trai tôi là bác sĩ.",
          explanation: "Am và is là động từ to be ở hiện tại"
        },
        {
          text: "Look! The children are playing in the garden.",
          translation: "Nhìn kìa! Bọn trẻ đang chơi trong vườn.",
          explanation: "Are playing là thì hiện tại tiếp diễn, diễn tả hành động đang diễn ra"
        },
        {
          text: "I usually go to work by bus, but today I am taking a taxi.",
          translation: "Tôi thường đi làm bằng xe buýt, nhưng hôm nay tôi đang đi taxi.",
          explanation: "Go là thì hiện tại đơn (thói quen), am taking là hiện tại tiếp diễn (hành động đang diễn ra)"
        }
      ]
    },
    // Days 7-35 would continue with similar structure
    {
      id: 7,
      title: 'Thì quá khứ và tương lai',
      topics: ['Thì quá khứ đơn', 'Thì tương lai đơn & tương lai gần Be going to'],
      level: 'basic',
      explanation: `
        <p><strong>Thì quá khứ đơn (Past Simple)</strong> diễn tả hành động đã xảy ra và kết thúc trong quá khứ:</p>
        <ul>
          <li>Cấu trúc: Subject + V2 (động từ chia ở quá khứ)</li>
          <li>Với động từ thường: thêm -ed hoặc dạng quá khứ bất quy tắc</li>
          <li>Với be: was/were</li>
          <li>Dạng phủ định: Subject + did not (didn't) + V1</li>
          <li>Dạng câu hỏi: Did + Subject + V1?</li>
        </ul>
        
        <p><strong>Thì tương lai đơn (Future Simple)</strong> diễn tả hành động sẽ xảy ra trong tương lai:</p>
        <ul>
          <li>Cấu trúc: Subject + will + V1</li>
          <li>Dạng phủ định: Subject + will not (won't) + V1</li>
          <li>Dạng câu hỏi: Will + Subject + V1?</li>
        </ul>
        
        <p><strong>Tương lai gần (Be going to)</strong> diễn tả kế hoạch trong tương lai hoặc dự đoán dựa trên bằng chứng hiện tại:</p>
        <ul>
          <li>Cấu trúc: Subject + am/is/are + going to + V1</li>
          <li>Dạng phủ định: Subject + am/is/are + not + going to + V1</li>
          <li>Dạng câu hỏi: Am/Is/Are + Subject + going to + V1?</li>
        </ul>
      `,
      examples: [
        {
          text: "I visited Paris last year.",
          translation: "Tôi đã thăm Paris năm ngoái.",
          explanation: "Visited là động từ ở thì quá khứ đơn"
        },
        {
          text: "She will call you tomorrow.",
          translation: "Cô ấy sẽ gọi cho bạn vào ngày mai.",
          explanation: "Will call là thì tương lai đơn"
        },
        {
          text: "Look at those dark clouds. It's going to rain.",
          translation: "Nhìn mây đen kia. Trời sắp mưa.",
          explanation: "Is going to rain sử dụng cấu trúc be going to để dự đoán dựa trên bằng chứng hiện tại"
        }
      ]
    },
    {
      id: 8,
      title: 'Ôn tập và Kiểm tra',
      topics: ['Review (Day 6 - Day 7)', 'Mini-test 3'],
      level: 'review',
      explanation: `
        <p>Hôm nay chúng ta sẽ ôn tập lại kiến thức về:</p>
        <ul>
          <li>Động từ To be</li>
          <li>Thì hiện tại tiếp diễn và hiện tại đơn</li>
          <li>Thì quá khứ đơn</li>
          <li>Thì tương lai đơn và tương lai gần</li>
        </ul>
        <p>Sau đó làm bài kiểm tra mini để đánh giá mức độ hiểu bài.</p>
      `,
      examples: []
    },
    // Thêm các ngày còn lại tương tự
  ]
} 