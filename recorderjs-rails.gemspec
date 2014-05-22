# -*- encoding: utf-8 -*-
require File.expand_path('../lib/recorderjs/rails/version', __FILE__)

Gem::Specification.new do |s|
  s.name = "recorderjs-rails"
  s.version = Recorderjs::Rails::VERSION
  s.platform = Gem::Platform::RUBY
  s.authors = ["SolarCS Rock Stars"]
  s.homepage = "https://github.com/SolarCS/recorderjs-rails"

  s.summary = "Use Recorderjs with Rails 4+"
  s.description = "This gem provides Recorderjs driver for your Rails 4+ application."

  s.required_rubygems_version = ">= 1.3.6"

  s.add_dependency "railties", ">= 3.0", "< 5.0"
  #s.add_dependency "thor", ">= 0.14", "< 2.0"

  s.files = `git ls-files`.split("\n")
  s.executables = `git ls-files -- bin/*`.split("\n").map { |f| File.basename(f) }
  s.require_path = 'lib'
end

