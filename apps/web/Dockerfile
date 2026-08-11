FROM node:24-alpine AS builder

# কন্টেইনারের ভেতরে ওয়ার্কিং ডিরেক্টরি সেট করা
WORKDIR /app

# pnpm প্যাকেজ ম্যানেজার গ্লোবালি ইনস্টল করা
RUN npm install -g pnpm@9.15.9

# ডকার ক্যাশ ব্যবহার করার জন্য প্রথমে package.json এবং pnpm-lock.yaml কপি করা
COPY package.json pnpm-lock.yaml ./

# ডিপেন্ডেন্সি ইনস্টল করা
RUN pnpm install --frozen-lockfile

# অ্যাপ্লিকেশনের বাকি সোর্স কোড কপি করা
COPY . .

# অ্যাপ্লিকেশন বিল্ড করা
RUN pnpm run build

# প্রোডাকশন ইমেজ তৈরি করা
FROM nginx:1.29-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# অ্যাপ্লিকেশনের জন্য ৮০ পোর্ট ওপেন করা
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
