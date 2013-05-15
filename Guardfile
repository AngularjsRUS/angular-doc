# Livereload

guard 'livereload' do
  watch(%r{(app|build|docs/src)/.+\.(css|js|html)})
end

guard 'shell' do
  watch %r{docs/content/.+\.(ngdoc)} do |f|
    puts ""
    puts `grunt docs`
  end
end
