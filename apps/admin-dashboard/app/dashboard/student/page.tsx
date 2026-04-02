export default function StudentPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <h1 className="text-2xl font-bold">Telegram orqali kiring</h1>
      <p className="text-gray-600 max-w-md">
        Testlarni topshirish uchun Telegram botimizdan foydalaning. Bu sahifa
        faqat o&apos;qituvchilar uchun mo&apos;ljallangan.
      </p>
      <a
        href="https://t.me/your_bot_username"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Telegram botga o&apos;tish
      </a>
    </div>
  );
}
